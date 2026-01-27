using Dapper;
using EgemenLisansYonetimiBackend.Api.Infrastructure.Db;

namespace EgemenLisansYonetimiBackend.Api.Features.SozlesmeOdeme;

public sealed class SozlesmeOdemeRepository
{
    private readonly IDbConnectionFactory _db;
    public SozlesmeOdemeRepository(IDbConnectionFactory db) => _db = db;

    // ============================
    // LIST
    // ============================
    public async Task<IReadOnlyList<SozlesmeOdemeDto>> ListAsync(int? sozlesmePlaniId = null)
    {
        var sql = @"
        SELECT
            SozlesmeOdemeId,
            SozlesmePlaniId,
            OdemeTipiId,
            OdemeYontemiId,

            PaynetPlanId,
            PaynetInvoiceId,
            PaynetXactId,
            PaynetStatus,
            PaynetStatusDesc,

            VadeTarihi,
            OdemeTarihi,
            Odendi,

            Tutar,
            DovizId,

            ReferenceNo,
            Aciklama,

            InsertTarihi,
            InsertKullaniciId,
            KullaniciId,
            DegisimTarihi
        FROM SozlesmeOdeme
        ";

        if (sozlesmePlaniId.HasValue)
            sql += " WHERE SozlesmePlaniId = @sozlesmePlaniId";

        sql += " ORDER BY SozlesmeOdemeId DESC";

        await using var conn = _db.Create();
        var rows = await conn.QueryAsync<SozlesmeOdemeDto>(sql, new { sozlesmePlaniId });
        return rows.AsList();
    }

    // ============================
    // GET BY ID
    // ============================
    public async Task<SozlesmeOdemeDto?> GetAsync(int sozlesmeOdemeId)
    {
        const string sql = @"
        SELECT
            SozlesmeOdemeId,
            SozlesmePlaniId,
            OdemeTipiId,
            OdemeYontemiId,

            PaynetPlanId,
            PaynetInvoiceId,
            PaynetXactId,
            PaynetStatus,
            PaynetStatusDesc,

            VadeTarihi,
            OdemeTarihi,
            Odendi,

            Tutar,
            DovizId,

            ReferenceNo,
            Aciklama,

            InsertTarihi,
            InsertKullaniciId,
            KullaniciId,
            DegisimTarihi
        FROM SozlesmeOdeme
        WHERE SozlesmeOdemeId = @sozlesmeOdemeId";

        await using var conn = _db.Create();
        return await conn.QuerySingleOrDefaultAsync<SozlesmeOdemeDto>(
            sql,
            new { sozlesmeOdemeId }
        );
    }

    // ============================
    // CREATE
    // ============================
    public async Task<int> CreateAsync(CreateSozlesmeOdemeRequest req)
    {
        const string sql = @"
        INSERT INTO SozlesmeOdeme (
            SozlesmePlaniId,
            OdemeTipiId,
            OdemeYontemiId,

            PaynetPlanId,
            PaynetInvoiceId,
            PaynetXactId,
            PaynetStatus,
            PaynetStatusDesc,

            VadeTarihi,
            OdemeTarihi,
            Odendi,

            Tutar,
            DovizId,

            ReferenceNo,
            Aciklama,

            InsertTarihi,
            InsertKullaniciId,
            KullaniciId,
            DegisimTarihi
        )
        VALUES (
            @SozlesmePlaniId,
            @OdemeTipiId,
            @OdemeYontemiId,

            @PaynetPlanId,
            @PaynetInvoiceId,
            @PaynetXactId,
            @PaynetStatus,
            @PaynetStatusDesc,

            @VadeTarihi,
            @OdemeTarihi,
            COALESCE(@Odendi, 0),

            @Tutar,
            COALESCE(@DovizId, 'EURO'),

            @ReferenceNo,
            @Aciklama,

            current_timestamp(0),
            1,
            1,
            current_timestamp(0)
        )
        RETURNING SozlesmeOdemeId;
        ";

        await using var conn = _db.Create();
        return await conn.ExecuteScalarAsync<int>(sql, req);
    }

    // ============================
    // UPDATE
    // ============================
    public async Task<bool> UpdateAsync(int sozlesmeOdemeId, UpdateSozlesmeOdemeRequest req)
    {
        const string sql = @"
        UPDATE SozlesmeOdeme SET
            SozlesmePlaniId     = @SozlesmePlaniId,
            OdemeTipiId         = @OdemeTipiId,
            OdemeYontemiId      = @OdemeYontemiId,

            PaynetPlanId        = @PaynetPlanId,
            PaynetInvoiceId     = @PaynetInvoiceId,
            PaynetXactId        = @PaynetXactId,
            PaynetStatus        = @PaynetStatus,
            PaynetStatusDesc    = @PaynetStatusDesc,

            VadeTarihi          = @VadeTarihi,
            OdemeTarihi         = @OdemeTarihi,
            Odendi              = @Odendi,

            Tutar               = @Tutar,
            DovizId             = @DovizId,

            ReferenceNo         = @ReferenceNo,
            Aciklama            = @Aciklama,

            DegisimTarihi       = current_timestamp(0)
        WHERE SozlesmeOdemeId = @sozlesmeOdemeId
        ";

        await using var conn = _db.Create();
        var affected = await conn.ExecuteAsync(sql, new
        {
            sozlesmeOdemeId,
            req.SozlesmePlaniId,
            req.OdemeTipiId,
            req.OdemeYontemiId,

            req.PaynetPlanId,
            req.PaynetInvoiceId,
            req.PaynetXactId,
            req.PaynetStatus,
            req.PaynetStatusDesc,

            req.VadeTarihi,
            req.OdemeTarihi,
            req.Odendi,

            req.Tutar,
            req.DovizId,

            req.ReferenceNo,
            req.Aciklama
        });

        return affected == 1;
    }

    // ============================
    // DELETE
    // ============================
    public async Task<bool> DeleteAsync(int sozlesmeOdemeId)
    {
        const string sql = @"DELETE FROM SozlesmeOdeme WHERE SozlesmeOdemeId = @sozlesmeOdemeId";

        await using var conn = _db.Create();
        var affected = await conn.ExecuteAsync(sql, new { sozlesmeOdemeId });
        return affected == 1;
    }
}
