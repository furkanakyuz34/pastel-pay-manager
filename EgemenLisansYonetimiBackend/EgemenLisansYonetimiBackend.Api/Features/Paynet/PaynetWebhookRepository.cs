using System.Data;
using Dapper;
using EgemenLisansYonetimiBackend.Api.Infrastructure.Db;

namespace EgemenLisansYonetimiBackend.Api.Features.Paynet;

public sealed class PaynetWebhookRepository
{
    private readonly IDbConnectionFactory _db;
    public PaynetWebhookRepository(IDbConnectionFactory db) => _db = db;

    /// <summary>
    /// Idempotency + ham log.
    /// Aynı EVENT_TYPE + XACT_ID gelirse unique index patlar -> false döneriz.
    /// </summary>
    public async Task<bool> TryInsertWebhookLogAsync(PaynetWebhookLogRow row, CancellationToken ct)
    {
        const string sql = @"
INSERT INTO PAYNET_WEBHOOK_LOG (
  EVENT_TYPE, SUBSCRIPTION_ID, REFERENCE_NO, XACT_ID, STATUS, AMOUNT,
  RAW_JSON, HEADERS, CLIENT_IP
)
VALUES (
  @EventType, @SubscriptionId, @ReferenceNo, @XactId, @Status, @Amount,
  @RawJson, @Headers, @ClientIp
);";

        try
        {
            await using var conn = _db.Create();
            await conn.ExecuteAsync(sql, row);
            return true;
        }
        catch (Exception ex)
        {
            // Firebird unique index violation yakala (SQLSTATE 23000 vb.) istersen burada ayrıştırırız.
            // Şimdilik: "zaten işlendi" diye kabul edelim.
            return false;
        }
    }

    /// <summary>
    /// Webhook'a göre SOZLESMEPLAN status güncelle (minimum viable).
    /// </summary>
    public async Task UpdatePlanStatusAsync(string? subscriptionId, string? referenceNo, short status, CancellationToken ct)
    {
        // subscription_id varsa ondan, yoksa reference_no ile bul
        const string sql = @"
UPDATE SOZLESMEPLAN
SET STATUS = @Status,
    DEGISTARIHI = CURRENT_TIMESTAMP
WHERE
    (@SubscriptionId IS NOT NULL AND SUBSCRIPTION_ID = @SubscriptionId)
 OR (@SubscriptionId IS NULL AND @ReferenceNo IS NOT NULL AND REFERENCE_NO = @ReferenceNo);
";

        await using var conn = _db.Create();
        await conn.ExecuteAsync(sql, new
        {
            SubscriptionId = subscriptionId,
            ReferenceNo = referenceNo,
            Status = status
        });
    }
}

public sealed record PaynetWebhookLogRow
{
    public string EventType { get; init; } = default!;
    public string? SubscriptionId { get; init; }
    public string? ReferenceNo { get; init; }
    public string? XactId { get; init; }
    public string? Status { get; init; }
    public string? Amount { get; init; }
    public string RawJson { get; init; } = default!;
    public string Headers { get; init; } = default!;
    public string? ClientIp { get; init; }
}
