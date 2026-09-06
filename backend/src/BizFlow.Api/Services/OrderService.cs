using BizFlow.Api.Contracts;
using BizFlow.Api.Data;
using BizFlow.Api.Domain;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace BizFlow.Api.Services;

public interface IOrderService
{
    Task<Order> CreateAsync(CreateOrderRequest request, CancellationToken cancellationToken);
    Task<Order?> UpdateStatusAsync(Guid id, OrderStatus status, CancellationToken cancellationToken);
}

public sealed class OrderService(BizFlowDbContext db) : IOrderService
{
    public async Task<Order> CreateAsync(CreateOrderRequest request, CancellationToken cancellationToken)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, cancellationToken);
        if (!await db.Customers.AnyAsync(x => x.Id == request.CustomerId, cancellationToken))
            throw new KeyNotFoundException("Customer was not found.");

        var requested = request.Items.GroupBy(x => x.ProductId).ToDictionary(x => x.Key, x => x.Sum(i => i.Quantity));
        var products = await db.Products.Where(x => requested.Keys.Contains(x.Id) && x.IsActive).ToListAsync(cancellationToken);
        if (products.Count != requested.Count) throw new KeyNotFoundException("One or more products were not found or are inactive.");

        var order = new Order
        {
            CustomerId = request.CustomerId,
            OrderNumber = $"BF-{DateTimeOffset.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpperInvariant()}"
        };

        foreach (var product in products)
        {
            var quantity = requested[product.Id];
            if (product.QuantityInStock < quantity)
                throw new InvalidOperationException($"Insufficient stock for {product.Name}. Available: {product.QuantityInStock}.");

            product.QuantityInStock -= quantity;
            product.UpdatedAt = DateTimeOffset.UtcNow;
            var lineTotal = decimal.Round(product.Price * quantity, 2);
            order.Items.Add(new OrderItem { ProductId = product.Id, ProductName = product.Name, Sku = product.Sku, Quantity = quantity, UnitPrice = product.Price, LineTotal = lineTotal });
            db.InventoryTransactions.Add(new InventoryTransaction { ProductId = product.Id, Type = InventoryTransactionType.Sale, QuantityChange = -quantity, QuantityAfter = product.QuantityInStock, Reference = order.OrderNumber });
        }

        order.Subtotal = order.Items.Sum(x => x.LineTotal);
        order.Tax = decimal.Round(order.Subtotal * request.TaxRate, 2);
        order.Total = order.Subtotal + order.Tax;
        db.Orders.Add(order);
        await db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return await GetOrderAsync(order.Id, cancellationToken) ?? order;
    }

    public async Task<Order?> UpdateStatusAsync(Guid id, OrderStatus status, CancellationToken cancellationToken)
    {
        var order = await db.Orders.Include(x => x.Items).SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (order is null) return null;
        if (order.Status == OrderStatus.Cancelled) throw new InvalidOperationException("A cancelled order cannot change status.");

        if (status == OrderStatus.Cancelled)
        {
            var productIds = order.Items.Select(x => x.ProductId).ToList();
            var products = await db.Products.Where(x => productIds.Contains(x.Id)).ToDictionaryAsync(x => x.Id, cancellationToken);
            foreach (var item in order.Items)
            {
                var product = products[item.ProductId];
                product.QuantityInStock += item.Quantity;
                db.InventoryTransactions.Add(new InventoryTransaction { ProductId = product.Id, Type = InventoryTransactionType.Return, QuantityChange = item.Quantity, QuantityAfter = product.QuantityInStock, Reference = order.OrderNumber, Note = "Order cancelled" });
            }
        }

        order.Status = status;
        order.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(cancellationToken);
        return order;
    }

    private Task<Order?> GetOrderAsync(Guid id, CancellationToken cancellationToken) => db.Orders.AsNoTracking().Include(x => x.Customer).Include(x => x.Items).SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
}
