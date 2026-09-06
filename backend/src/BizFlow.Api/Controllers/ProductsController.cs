using BizFlow.Api.Contracts;
using BizFlow.Api.Data;
using BizFlow.Api.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BizFlow.Api.Controllers;

[ApiController, Route("api/products")]
public sealed class ProductsController(BizFlowDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<Product>>> GetAll([FromQuery] string? search, [FromQuery] bool lowStock, CancellationToken ct)
    {
        var query = db.Products.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(search)) query = query.Where(x => EF.Functions.ILike(x.Name, $"%{search}%") || EF.Functions.ILike(x.Sku, $"%{search}%"));
        if (lowStock) query = query.Where(x => x.QuantityInStock <= x.ReorderLevel);
        return Ok(await query.OrderBy(x => x.Name).ToListAsync(ct));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Product>> Get(Guid id, CancellationToken ct) =>
        await db.Products.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id, ct) is { } product ? Ok(product) : NotFound();

    [HttpPost]
    public async Task<ActionResult<Product>> Create(CreateProductRequest request, CancellationToken ct)
    {
        var sku = request.Sku.Trim().ToUpperInvariant();
        if (await db.Products.AnyAsync(x => x.Sku == sku, ct)) return Conflict(new { message = "SKU already exists." });
        var product = new Product { Name = request.Name.Trim(), Sku = sku, Description = request.Description?.Trim(), Price = request.Price, QuantityInStock = request.InitialStock, ReorderLevel = request.ReorderLevel };
        db.Products.Add(product);
        if (request.InitialStock > 0) db.InventoryTransactions.Add(new InventoryTransaction { ProductId = product.Id, Type = InventoryTransactionType.InitialStock, QuantityChange = request.InitialStock, QuantityAfter = request.InitialStock, Note = "Opening inventory" });
        await db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(Get), new { id = product.Id }, product);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<Product>> Update(Guid id, UpdateProductRequest request, CancellationToken ct)
    {
        var product = await db.Products.SingleOrDefaultAsync(x => x.Id == id, ct);
        if (product is null) return NotFound();
        product.Name = request.Name.Trim(); product.Description = request.Description?.Trim(); product.Price = request.Price;
        product.ReorderLevel = request.ReorderLevel; product.IsActive = request.IsActive; product.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);
        return Ok(product);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Archive(Guid id, CancellationToken ct)
    {
        var product = await db.Products.SingleOrDefaultAsync(x => x.Id == id, ct);
        if (product is null) return NotFound();
        product.IsActive = false; product.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }
}
