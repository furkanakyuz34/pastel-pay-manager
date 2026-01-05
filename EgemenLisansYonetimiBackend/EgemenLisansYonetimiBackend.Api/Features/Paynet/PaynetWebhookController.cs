using System.Text;
using System.Text.Json;
using EgemenLisansYonetimiBackend.Api.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EgemenLisansYonetimiBackend.Api.Features.Paynet;

[ApiController]
[Route("api/paynet/webhook")]
[AllowAnonymous] // Paynet dış sistem
public sealed class PaynetWebhookController : ControllerBase
{
    private readonly PaynetWebhookRepository _repo;
    private readonly ILogger<PaynetWebhookController> _logger;

    public PaynetWebhookController(PaynetWebhookRepository repo, ILogger<PaynetWebhookController> logger)
    {
        _repo = repo;
        _logger = logger;
    }

    [HttpPost("confirmation")]
    public Task<IActionResult> Confirmation([FromBody] JsonElement body, CancellationToken ct)
        => Handle("confirmation", body, ct);

    [HttpPost("succeed")]
    public Task<IActionResult> Succeed([FromBody] JsonElement body, CancellationToken ct)
        => Handle("succeed", body, ct);

    [HttpPost("error")]
    public Task<IActionResult> Error([FromBody] JsonElement body, CancellationToken ct)
        => Handle("error", body, ct);

    private async Task<IActionResult> Handle(string eventType, JsonElement body, CancellationToken ct)
    {
        var traceId = HttpContext.TraceIdentifier;

        // Header dump (debug + kanıt)
        var headersStr = string.Join("\n", Request.Headers.Select(h => $"{h.Key}: {h.Value}"));

        // Raw json
        var rawJson = body.GetRawText();

        // Esnek alan çekme
        var subscriptionId = PaynetWebhookParser.TryGetString(body, "subscription_id", "subscriptionId");
        var referenceNo = PaynetWebhookParser.TryGetString(body, "reference_no", "referenceNo");
        var xactId = PaynetWebhookParser.TryGetString(body, "xact_id", "xactId", "transaction_id", "transactionId");
        var statusText = PaynetWebhookParser.TryGetString(body, "status", "payment_status", "result");
        var amount = PaynetWebhookParser.TryGetString(body, "amount", "total_amount");

        var clientIp = HttpContext.Connection.RemoteIpAddress?.ToString();

        // Idempotency + log
        var inserted = await _repo.TryInsertWebhookLogAsync(new PaynetWebhookLogRow
        {
            EventType = eventType,
            SubscriptionId = subscriptionId,
            ReferenceNo = referenceNo,
            XactId = xactId,
            Status = statusText,
            Amount = amount,
            RawJson = rawJson,
            Headers = headersStr,
            ClientIp = clientIp
        }, ct);

        // Aynı webhook tekrar geldiyse: OK dön (Paynet tekrar denemesin)
        if (!inserted)
        {
            return Ok(ApiResponse<object>.Ok(
                data: new { received = true, duplicated = true },
                message: "Webhook daha önce işlendi.",
                traceId: traceId));
        }

        // Plan status mapping (senin STATUS enum'una göre revize edersin)
        // 10: confirmed, 11: payment_succeed, 12: payment_error gibi kurguladım
        short newStatus = eventType switch
        {
            "confirmation" => 10,
            "succeed" => 11,
            "error" => 12,
            _ => 0
        };

        // Minimum: plan status güncelle
        await _repo.UpdatePlanStatusAsync(subscriptionId, referenceNo, newStatus, ct);

        return Ok(ApiResponse<object>.Ok(
            data: new { received = true, eventType, subscriptionId, referenceNo, xactId },
            message: "Webhook alındı.",
            traceId: traceId));
    }
}
