using BizFlow.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace BizFlow.Api.Data;

public static class DatabaseInitializer
{
    public static async Task InitializeAsync(IServiceProvider services)
    {
        await using var scope = services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<BizFlowDbContext>();
        await db.Database.EnsureCreatedAsync();
        if (await db.Products.AnyAsync()) return;

        var products = new[]
        {
            new Product { Name = "Classic gift box", Sku = "GB-102", Description = "Curated gift box", Price = 49.95m, QuantityInStock = 3, ReorderLevel = 10 },
            new Product { Name = "Vanilla candle", Sku = "VC-044", Description = "Hand-poured vanilla candle", Price = 24.00m, QuantityInStock = 6, ReorderLevel = 10 },
            new Product { Name = "Ceramic mug", Sku = "CM-118", Description = "Premium ceramic mug", Price = 18.50m, QuantityInStock = 8, ReorderLevel = 12 },
            new Product { Name = "Premium hamper", Sku = "PH-220", Description = "Corporate premium hamper", Price = 125.00m, QuantityInStock = 40, ReorderLevel = 8 }
        };
        var customers = new[]
        {
            new Customer { Name = "Amara Foods", Email = "orders@amarafoods.example", Phone = "+1-416-555-0101" },
            new Customer { Name = "Noah Williams", Email = "noah.williams@example.com", Phone = "+1-647-555-0102" },
            new Customer { Name = "Maple Events", Email = "hello@mapleevents.example", Phone = "+1-905-555-0103" }
        };
        db.Products.AddRange(products);
        db.Customers.AddRange(customers);
        db.InventoryTransactions.AddRange(products.Select(x => new InventoryTransaction { ProductId = x.Id, Type = InventoryTransactionType.InitialStock, QuantityChange = x.QuantityInStock, QuantityAfter = x.QuantityInStock, Note = "Demo seed inventory" }));
        await db.SaveChangesAsync();
    }
}
