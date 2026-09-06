using BizFlow.Api.Contracts;
using BizFlow.Api.Data;
using BizFlow.Api.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BizFlow.Api.Controllers;

[ApiController, Route("api/customers")]
public sealed class CustomersController(BizFlowDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<Customer>>> GetAll([FromQuery] string? search, CancellationToken ct)
    {
        var query = db.Customers.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(search)) query = query.Where(x => EF.Functions.ILike(x.Name, $"%{search}%") || EF.Functions.ILike(x.Email, $"%{search}%"));
        return Ok(await query.OrderBy(x => x.Name).ToListAsync(ct));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Customer>> Get(Guid id, CancellationToken ct) =>
        await db.Customers.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id, ct) is { } customer ? Ok(customer) : NotFound();

    [HttpPost]
    public async Task<ActionResult<Customer>> Create(CreateCustomerRequest request, CancellationToken ct)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        if (await db.Customers.AnyAsync(x => x.Email == email, ct)) return Conflict(new { message = "Email already exists." });
        var customer = new Customer { Name = request.Name.Trim(), Email = email, Phone = request.Phone?.Trim(), Address = request.Address?.Trim() };
        db.Customers.Add(customer); await db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(Get), new { id = customer.Id }, customer);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<Customer>> Update(Guid id, UpdateCustomerRequest request, CancellationToken ct)
    {
        var customer = await db.Customers.SingleOrDefaultAsync(x => x.Id == id, ct);
        if (customer is null) return NotFound();
        var email = request.Email.Trim().ToLowerInvariant();
        if (await db.Customers.AnyAsync(x => x.Email == email && x.Id != id, ct)) return Conflict(new { message = "Email already exists." });
        customer.Name = request.Name.Trim(); customer.Email = email; customer.Phone = request.Phone?.Trim(); customer.Address = request.Address?.Trim(); customer.UpdatedAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync(ct);
        return Ok(customer);
    }
}
