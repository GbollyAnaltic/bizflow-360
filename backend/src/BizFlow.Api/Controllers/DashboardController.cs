using BizFlow.Api.Data;
using BizFlow.Api.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BizFlow.Api.Controllers;

[ApiController, Route("api/dashboard")]
public sealed class DashboardController(BizFlowDbContext db) : ControllerBase
{
    [HttpGet("summary")]
    public async Task<IActionResult> Summary(CancellationToken ct)
    {
        var today = new DateTimeOffset(DateTime.UtcNow.Date, TimeSpan.Zero);
        var activeStatuses = new[] { OrderStatus.Paid, OrderStatus.Processing, OrderStatus.Ready, OrderStatus.Completed };
        var ordersToday = db.Orders.Where(x => x.CreatedAt >= today);
        return Ok(new
        {
            revenueToday = await ordersToday.Where(x => activeStatuses.Contains(x.Status)).SumAsync(x => x.Total, ct),
            ordersToday = await ordersToday.CountAsync(ct),
            activeProducts = await db.Products.CountAsync(x => x.IsActive, ct),
            lowStockProducts = await db.Products.CountAsync(x => x.IsActive && x.QuantityInStock <= x.ReorderLevel, ct),
            totalCustomers = await db.Customers.CountAsync(ct)
        });
    }
}
