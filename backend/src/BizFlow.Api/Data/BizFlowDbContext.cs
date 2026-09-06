using BizFlow.Api.Domain;
using Microsoft.EntityFrameworkCore;

namespace BizFlow.Api.Data;

public sealed class BizFlowDbContext(DbContextOptions<BizFlowDbContext> options) : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<InventoryTransaction> InventoryTransactions => Set<InventoryTransaction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasPostgresEnum<OrderStatus>();
        modelBuilder.HasPostgresEnum<InventoryTransactionType>();

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasIndex(x => x.Sku).IsUnique();
            entity.Property(x => x.Name).HasMaxLength(160);
            entity.Property(x => x.Sku).HasMaxLength(64);
            entity.Property(x => x.Price).HasPrecision(12, 2);
            entity.ToTable(table =>
            {
                table.HasCheckConstraint("CK_Products_Price", "\"Price\" >= 0");
                table.HasCheckConstraint("CK_Products_Stock", "\"QuantityInStock\" >= 0");
            });
        });

        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasIndex(x => x.Email).IsUnique();
            entity.Property(x => x.Name).HasMaxLength(160);
            entity.Property(x => x.Email).HasMaxLength(254);
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasIndex(x => x.OrderNumber).IsUnique();
            entity.Property(x => x.OrderNumber).HasMaxLength(32);
            entity.Property(x => x.Subtotal).HasPrecision(12, 2);
            entity.Property(x => x.Tax).HasPrecision(12, 2);
            entity.Property(x => x.Total).HasPrecision(12, 2);
            entity.HasOne(x => x.Customer).WithMany(x => x.Orders).HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.Property(x => x.UnitPrice).HasPrecision(12, 2);
            entity.Property(x => x.LineTotal).HasPrecision(12, 2);
            entity.HasOne(x => x.Product).WithMany(x => x.OrderItems).HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<InventoryTransaction>()
            .HasOne(x => x.Product).WithMany(x => x.InventoryTransactions)
            .HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);
    }
}
