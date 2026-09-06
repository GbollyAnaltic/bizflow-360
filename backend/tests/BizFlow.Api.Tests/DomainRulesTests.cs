using BizFlow.Api.Contracts;
using BizFlow.Api.Data;
using BizFlow.Api.Domain;
using BizFlow.Api.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Xunit;

namespace BizFlow.Api.Tests;

public sealed class DomainRulesTests
{
    [Fact]
    public async Task CreateOrder_CalculatesTotalsAndReducesStock()
    {
        await using var db = CreateDatabase();
        var customer = new Customer { Name = "Test Customer", Email = "customer@example.com" };
        var product = new Product { Name = "Gift Box", Sku = "GIFT-1", Price = 20m, QuantityInStock = 10 };
        db.AddRange(customer, product); await db.SaveChangesAsync();

        var order = await new OrderService(db).CreateAsync(new CreateOrderRequest(customer.Id, [new(product.Id, 2)], 0.10m), default);

        Assert.Equal(40m, order.Subtotal);
        Assert.Equal(4m, order.Tax);
        Assert.Equal(44m, order.Total);
        Assert.Equal(8, product.QuantityInStock);
        Assert.Contains(db.InventoryTransactions, x => x.QuantityChange == -2 && x.QuantityAfter == 8);
    }

    [Fact]
    public async Task CreateOrder_RejectsInsufficientStock()
    {
        await using var db = CreateDatabase();
        var customer = new Customer { Name = "Test Customer", Email = "customer@example.com" };
        var product = new Product { Name = "Gift Box", Sku = "GIFT-1", Price = 20m, QuantityInStock = 1 };
        db.AddRange(customer, product); await db.SaveChangesAsync();

        var action = () => new OrderService(db).CreateAsync(new CreateOrderRequest(customer.Id, [new(product.Id, 2)]), default);
        await Assert.ThrowsAsync<InvalidOperationException>(action);
        Assert.Equal(1, product.QuantityInStock);
    }

    [Fact]
    public async Task CancelOrder_RestoresStock()
    {
        await using var db = CreateDatabase();
        var customer = new Customer { Name = "Test Customer", Email = "customer@example.com" };
        var product = new Product { Name = "Gift Box", Sku = "GIFT-1", Price = 20m, QuantityInStock = 5 };
        db.AddRange(customer, product); await db.SaveChangesAsync();
        var service = new OrderService(db);
        var order = await service.CreateAsync(new CreateOrderRequest(customer.Id, [new(product.Id, 2)]), default);

        await service.UpdateStatusAsync(order.Id, OrderStatus.Cancelled, default);

        Assert.Equal(5, product.QuantityInStock);
        Assert.Contains(db.InventoryTransactions, x => x.Type == InventoryTransactionType.Return && x.QuantityChange == 2);
    }

    private static BizFlowDbContext CreateDatabase()
    {
        var options = new DbContextOptionsBuilder<BizFlowDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .ConfigureWarnings(x => x.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;
        return new BizFlowDbContext(options);
    }
}
