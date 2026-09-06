using System.ComponentModel.DataAnnotations;
using BizFlow.Api.Domain;

namespace BizFlow.Api.Contracts;

public sealed record CreateProductRequest(
    [property: Required, StringLength(160)] string Name,
    [property: Required, StringLength(64)] string Sku,
    [property: StringLength(1000)] string? Description,
    [property: Range(0, 999999999)] decimal Price,
    [property: Range(0, int.MaxValue)] int InitialStock,
    [property: Range(0, int.MaxValue)] int ReorderLevel = 5);

public sealed record UpdateProductRequest(
    [property: Required, StringLength(160)] string Name,
    [property: StringLength(1000)] string? Description,
    [property: Range(0, 999999999)] decimal Price,
    [property: Range(0, int.MaxValue)] int ReorderLevel,
    bool IsActive);

public sealed record CreateCustomerRequest(
    [property: Required, StringLength(160)] string Name,
    [property: Required, EmailAddress, StringLength(254)] string Email,
    [property: Phone, StringLength(40)] string? Phone,
    [property: StringLength(500)] string? Address);

public sealed record UpdateCustomerRequest(
    [property: Required, StringLength(160)] string Name,
    [property: Required, EmailAddress, StringLength(254)] string Email,
    [property: Phone, StringLength(40)] string? Phone,
    [property: StringLength(500)] string? Address);

public sealed record AdjustInventoryRequest(
    int QuantityChange,
    InventoryTransactionType Type,
    [property: StringLength(100)] string? Reference,
    [property: StringLength(500)] string? Note);

public sealed record CreateOrderItemRequest(Guid ProductId, [property: Range(1, 10000)] int Quantity);
public sealed record CreateOrderRequest(Guid CustomerId, [property: MinLength(1)] List<CreateOrderItemRequest> Items, [property: Range(0, 1)] decimal TaxRate = 0.13m);
public sealed record UpdateOrderStatusRequest(OrderStatus Status);
