using Dapper;
using EgemenLisansYonetimiBackend.Api.Infrastructure.Db;

namespace EgemenLisansYonetimiBackend.Api.Features.SozlesmePlani;

public sealed class SozlesmePlaniRepository
{
    private readonly IDbConnectionFactory _db;
    public SozlesmePlaniRepository(IDbConnectionFactory db) => _db = db;

    public async Task<long> InsertAsync(InsertSozlesmePlaniCommand cmd, CancellationToken ct = default)
    {
        const string sql = @"
INSERT INTO SOZLESMEPLANI (
  SOZLESMEID,
  PLANID,
  GENELISKONTO,
  ABONELIKISKONTO,
  ABONELIKBASLANGICTARIHI,
  PESINATTUTARI,
  ABONELIKUCRETI,
  DOVIZID,
  INSERTTARIHI,
  INSERTKULLANICIID,
  KULLANICIID,
  DEGISIMTARIHI
)
VALUES (
  @SozlesmeId,
  @PlanId,
  @GenelIskonto,
  @AbonelikIskonto,
  @AbonelikBaslangicTarihi,
  @PesinatTutari,
  @AbonelikUcreti,
  @DovizId,
  CURRENT_TIMESTAMP,
  @InsertKullaniciId,
  @KullaniciId,
  CURRENT_TIMESTAMP
)
RETURNING SOZLESMEPLANID;
";

        await using var conn = _db.Create();
        var parameters = new
        {
            cmd.SozlesmeId,
            cmd.PlanId,
            cmd.GenelIskonto,
            cmd.AbonelikIskonto,
            cmd.AbonelikBaslangicTarihi,
            cmd.PesinatTutari,
            cmd.AbonelikUcreti,
            DovizId = string.IsNullOrWhiteSpace(cmd.DovizId) ? "EURO" : cmd.DovizId,
            InsertKullaniciId = cmd.InsertKullaniciId ?? 1,
            KullaniciId = cmd.KullaniciId ?? 1
        };

        var def = new CommandDefinition(sql, parameters, cancellationToken: ct);
        return await conn.ExecuteScalarAsync<long>(def);
    }


    public async Task<bool> UpdateAsync(UpdateSozlesmePlaniCommand cmd, CancellationToken ct = default)
    {
        const string sql = @"
UPDATE SOZLESMEPLANI
SET
  PLANID = COALESCE(@PlanId, PLANID),
  GENELISKONTO = COALESCE(@GenelIskonto, GENELISKONTO),
  ABONELIKISKONTO = COALESCE(@AbonelikIskonto, ABONELIKISKONTO),
  ABONELIKBASLANGICTARIHI = COALESCE(@AbonelikBaslangicTarihi, ABONELIKBASLANGICTARIHI),
  PESINATTUTARI = COALESCE(@PesinatTutari, PESINATTUTARI),
  ABONELIKUCRETI = COALESCE(@AbonelikUcreti, ABONELIKUCRETI),
  DOVIZID = COALESCE(@DovizId, DOVIZID),
  DEGISIMTARIHI = CURRENT_TIMESTAMP
WHERE SOZLESMEPLANID = @SozlesmePlanId;
";

        await using var conn = _db.Create();
        var def = new CommandDefinition(sql, new
        {
            cmd.SozlesmePlanId,
            cmd.PlanId,
            cmd.GenelIskonto,
            cmd.AbonelikIskonto,
            cmd.AbonelikBaslangicTarihi,
            cmd.PesinatTutari,
            cmd.AbonelikUcreti,
            cmd.DovizId
        }, cancellationToken: ct);

        var affected = await conn.ExecuteAsync(def);
        return affected == 1;
    }

    public async Task<SozlesmePlaniUcretRow?> CalculateUcretAsync(
        long sozlesmeId,
        int planId,
        decimal? genelIskonto,
        decimal? abonelikIskonto,
        string? hedefDovizId,
        CancellationToken ct = default)
    {
        const string sql = @"
SELECT
  TOPLAMTUTAR,
  PESINATTUTARI,
  ABONELIKUCRETI
FROM SOZLESMEPLANUCRETHESAPLA(
  @SozlesmeId,
  @PlanId,
  @GenelIskonto,
  @AbonelikIskonto,
  @HedefDovizId
);";

        await using var conn = _db.Create();
        var def = new CommandDefinition(sql, new
        {
            SozlesmeId = sozlesmeId,
            PlanId = planId,
            GenelIskonto = genelIskonto,
            AbonelikIskonto = abonelikIskonto,
            HedefDovizId = string.IsNullOrWhiteSpace(hedefDovizId) ? "EURO" : hedefDovizId
        }, cancellationToken: ct);

        return await conn.QuerySingleOrDefaultAsync<SozlesmePlaniUcretRow>(def);
    }


    public async Task<bool> DeleteAsync(long sozlesmePlanId, CancellationToken ct = default)
    {
        const string sql = @"
DELETE FROM SOZLESMEPLANI
WHERE SOZLESMEPLANID = @sozlesmePlanId;";

        await using var conn = _db.Create();
        var def = new CommandDefinition(sql, new { sozlesmePlanId }, cancellationToken: ct);
        var affected = await conn.ExecuteAsync(def);
        return affected == 1;
    }
    public async Task<SozlesmePlaniRow?> GetBySozlesmeIdAsync(long sozlesmeId, CancellationToken ct = default)
    {
        const string sql = @"
SELECT FIRST 1
  SOZLESMEPLANID,
  SOZLESMEID,
  PLANID,
  GENELISKONTO,
  ABONELIKISKONTO,
  ABONELIKBASLANGICTARIHI,
  PESINATTUTARI,
  ABONELIKUCRETI,
  DOVIZID,
  INSERTTARIHI,
  INSERTKULLANICIID,
  KULLANICIID,
  DEGISIMTARIHI
FROM SOZLESMEPLANI
WHERE SOZLESMEID = @SozlesmeId
ORDER BY SOZLESMEPLANID DESC;";

        await using var conn = _db.Create();
        var def = new CommandDefinition(sql, new { SozlesmeId = sozlesmeId }, cancellationToken: ct);
        return await conn.QuerySingleOrDefaultAsync<SozlesmePlaniRow>(def);
    }
}