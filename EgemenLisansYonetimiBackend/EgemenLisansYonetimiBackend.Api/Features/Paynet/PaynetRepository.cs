using System.Data;
using Dapper;
using EgemenLisansYonetimiBackend.Api.Infrastructure.Db;

namespace EgemenLisansYonetimiBackend.Api.Features.Paynet;

public sealed class PaynetRepository
{
    private readonly IDbConnectionFactory _db;
    public PaynetRepository(IDbConnectionFactory db) => _db = db;

    /// <summary>
    /// UI'dan gelen plan + taksitleri tek transaction içinde yazar.
    /// UsePaynet=1 ise subscription create'e gideceğiz, ama subscription_id
    /// Paynet'ten döndükten sonra UpdatePlanPaynetResult ile yazılacak.
    /// </summary>
    public async Task<long> InsertPlanAndItemsAsync(
        InsertPlanCommand cmd,
        CancellationToken ct)
    {
        const string insertPlanSql = @"
INSERT INTO SOZLESMEPLAN (
  SOZLESMEID,
  NAME_SURNAME,
  AMOUNT,
  USE_PAYNET,
  STATUS,
  INSERTTARIHI, INSERTKULLANICIID, KULLANICIID
)
VALUES (
  @SozlesmeId,
  @NameSurname,
  @Amount,
  @UsePaynet,
  0,
  CURRENT_TIMESTAMP, @UserId, @UserId
)
RETURNING SOZLESMEPLANID;
";

        const string insertDetaySql = @"
INSERT INTO SOZLESMEPLANDETAY (
  SOZLESMEPLANID,
  SIRA,
  INVOICE_ID,
  VAL_DATE,
  AMOUNT,
  STATUS,
  INSERTTARIHI, INSERTKULLANICIID, KULLANICIID
)
VALUES (
  @PlanId,
  @Sira,
  @InvoiceId,
  @ValDate,
  @Amount,
  0,
  CURRENT_TIMESTAMP, @UserId, @UserId
);
";

        await using var conn = _db.Create();

        // FirebirdTransaction async dispose garanti değil; güvenli olsun diye using
        using var tx = conn.BeginTransaction();

        try
        {
            var planId = await conn.ExecuteScalarAsync<long>(
                insertPlanSql,
                new
                {
                    SozlesmeId = cmd.SozlesmeId,
                    NameSurname = cmd.NameSurname,
                    Amount = cmd.TotalAmount,
                    UsePaynet = cmd.UsePaynet ? 1 : 0,
                    UserId = cmd.UserId
                },
                tx
            );

            if (cmd.Items is { Count: > 0 })
            {
                foreach (var it in cmd.Items.OrderBy(x => x.Sira))
                {
                    await conn.ExecuteAsync(
                        insertDetaySql,
                        new
                        {
                            PlanId = planId,
                            it.Sira,
                            it.InvoiceId,
                            ValDate = it.ValDate?.Date,
                            Amount = it.Amount,
                            UserId = cmd.UserId
                        },
                        tx
                    );
                }
            }

            tx.Commit();
            return planId;
        }
        catch
        {
            tx.Rollback();
            throw;
        }
    }

    /// <summary>
    /// Paynet abonelik oluşturma sonucu ile planı günceller.
    /// code=0 başarı kabul edip STATUS=1, aksi STATUS=2 (hata) basıyoruz.
    /// </summary>
    public async Task UpdatePlanPaynetResultAsync(
        UpdatePaynetResultCommand cmd,
        CancellationToken ct)
    {
        const string sql = @"
UPDATE SOZLESMEPLAN
SET
  SUBSCRIPTION_ID = @SubscriptionId,
  STATUS = @Status,
  -- varsa DB'de tutmak istersen bunları da açarsın:
  -- STATUS_DESC = @Message,
  DEGISTARIHI = CURRENT_TIMESTAMP
WHERE SOZLESMEPLANID = @SozlesmePlanId;
";

        var mappedStatus = (cmd.Code == 0 && !string.IsNullOrWhiteSpace(cmd.SubscriptionId)) ? 1 : 2;

        await using var conn = _db.Create();
        await conn.ExecuteAsync(sql, new
        {
            SozlesmePlanId = cmd.SozlesmePlanId,
            SubscriptionId = cmd.SubscriptionId,
            Status = mappedStatus,
            Message = cmd.Message
        });
    }

    /// <summary>
    /// UI tarafına göstermek için planı hızlıca döndürmek istersen.
    /// </summary>
    public async Task<SozlesmePlanRow?> GetPlanAsync(long sozlesmePlanId)
    {
        const string sql = @"
SELECT
  SOZLESMEPLANID AS SozlesmePlanId,
  SOZLESMEID     AS SozlesmeId,
  SUBSCRIPTION_ID AS SubscriptionId,
  NAME_SURNAME   AS NameSurname,
  AMOUNT         AS Amount,
  USE_PAYNET     AS UsePaynet,
  STATUS         AS Status
FROM SOZLESMEPLAN
WHERE SOZLESMEPLANID = @sozlesmePlanId
";
        await using var conn = _db.Create();
        return await conn.QuerySingleOrDefaultAsync<SozlesmePlanRow>(sql, new { sozlesmePlanId });
    }
}

/* ----------------- COMMAND/ROW MODELS ----------------- */

public sealed record InsertPlanCommand
{
    public long SozlesmeId { get; init; }
    public bool UsePaynet { get; init; }
    public string? NameSurname { get; init; }
    public decimal TotalAmount { get; init; }
    public long UserId { get; init; }
    public List<InsertPlanItem> Items { get; init; } = new();
}

public sealed record InsertPlanItem
{
    public int Sira { get; init; }
    public DateTime? ValDate { get; init; }
    public decimal Amount { get; init; }
    public string? InvoiceId { get; init; }
}

public sealed record UpdatePaynetResultCommand
{
    public long SozlesmePlanId { get; init; }
    public int Code { get; init; }
    public string? Message { get; init; }
    public string? SubscriptionId { get; init; }
    public string? Url { get; init; } // DB’ye yazmak istersen kolon ekleriz
}

public sealed record SozlesmePlanRow
{
    public long SozlesmePlanId { get; init; }
    public long SozlesmeId { get; init; }
    public string? SubscriptionId { get; init; }
    public string? NameSurname { get; init; }
    public decimal Amount { get; init; }
    public short UsePaynet { get; init; }
    public short Status { get; init; }
}
