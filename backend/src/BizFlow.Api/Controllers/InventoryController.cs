using BizFlow.Api.Contracts;
using BizFlow.Api.Data;
using BizFlow.Api.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BizFlow.Api.Controllers;

[ApiController, Route("api/inventory")]
public sealed class InventoryController(BizFlowDbContext db) : ControllerBase
{
    [HttpGet("transactions")]
    public async Task<ActionResult<IReadOnlyList<InventoryTransaction>>> History([FromQuery] Guid? productId, CancellationToken ct)
    {
        var query = db.InventoryTransactions.AsNoTracking();
        if (productId.HasValue) query = query.Where(x => x.ProductId == productId);
        return Ok(await query.OrderByDescending(x => x.CreatedAt).Take(200).ToListAsync(ct));
    }

    [HttpPost("products/{productId:guid}/adjustments")]
    public async Task<ActionResult<Product>> Adjust(Guid productId, AdjustInventoryRequest request, CancellationToken ct)
    {
        if (request.QuantityChange == 0) return BadRequest(new { message = "Quantity change cannot be zero." });
        if (request.Type is InventoryTransactionType.InitialStock or InventoryTransactionType.Sale or InventoryTransactionType.Return)
            return BadRequest(new { message = "Use Purchase or Adjustment for manual inventory changes." });
        var product = await db.Products.SingleOrDefaultAsync(x => x.Id == productId, ct);
        if (product is null) return NotFound();
        if (product.QuantityInStock + request.QuantityChange < 0) return Conflict(new { message = "Adjustment would make stock negative." });
        product.QuantityInStock += request.QuantityChange; product.UpdatedAt = DateTimeOffset.UtcNow;
        db.InventoryTransactions.Add(new InventoryTransaction { ProductId = product.Id, Type = request.Type, QuantityChange = request.QuantityChange, QuantityAfter = product.QuantityInStock, Reference = request.Reference, Note = request.Note });
        await db.SaveChangesAsync(ct);
        return Ok(product);
    }
}
