using BizFlow.Api.Contracts;
using BizFlow.Api.Data;
using BizFlow.Api.Domain;
using BizFlow.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BizFlow.Api.Controllers;

[ApiController, Route("api/orders")]
public sealed class OrdersController(BizFlowDbContext db, IOrderService orders) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<Order>>> GetAll([FromQuery] OrderStatus? status, [FromQuery] string? search, CancellationToken ct)
    {
        var query = db.Orders.AsNoTracking().Include(x => x.Customer).Include(x => x.Items).AsQueryable();
        if (status.HasValue) query = query.Where(x => x.Status == status);
        if (!string.IsNullOrWhiteSpace(search)) query = query.Where(x => EF.Functions.ILike(x.OrderNumber, $"%{search}%") || EF.Functions.ILike(x.Customer.Name, $"%{search}%"));
        return Ok(await query.OrderByDescending(x => x.CreatedAt).Take(100).ToListAsync(ct));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Order>> Get(Guid id, CancellationToken ct) =>
        await db.Orders.AsNoTracking().Include(x => x.Customer).Include(x => x.Items).SingleOrDefaultAsync(x => x.Id == id, ct) is { } order ? Ok(order) : NotFound();

    [HttpPost]
    public async Task<ActionResult<Order>> Create(CreateOrderRequest request, CancellationToken ct)
    {
        var order = await orders.CreateAsync(request, ct);
        return CreatedAtAction(nameof(Get), new { id = order.Id }, order);
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<ActionResult<Order>> UpdateStatus(Guid id, UpdateOrderStatusRequest request, CancellationToken ct) =>
        await orders.UpdateStatusAsync(id, request.Status, ct) is { } order ? Ok(order) : NotFound();
}
