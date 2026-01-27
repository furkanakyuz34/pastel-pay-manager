using Dapper;
using EgemenLisansYonetimiBackend.Api.Infrastructure.Db;
using FirebirdSql.Data.FirebirdClient;

namespace EgemenLisansYonetimiBackend.Api.Features.SozlesmeModul;

public sealed class SozlesmeModulRepository
{
    private readonly IDbConnectionFactory _db;
    public SozlesmeModulRepository(IDbConnectionFactory db) => _db = db;

    public async Task<IEnumerable<SozlesmeModulRow>> ListAsync(long sozlesmeId, CancellationToken ct = default)
    {
        const string sql = @"
SELECT
  SOZLESMEID AS SozlesmeId,
  PROJEID AS ProjeId,
  PROJEMODULID AS ProjeModulId,
  ADET AS Adet,
  ISKONTO AS Iskonto
FROM SOZLESMEMODUL
WHERE SOZLESMEID = @sozlesmeId
ORDER BY PROJEID, PROJEMODULID;";

        await using var conn = _db.Create();
        var def = new CommandDefinition(sql, new { sozlesmeId }, cancellationToken: ct);
        return await conn.QueryAsync<SozlesmeModulRow>(def);
    }

    public async Task<SozlesmeModulRow?> GetAsync(long sozlesmeId, long projeId, long projeModulId, CancellationToken ct = default)
    {
        const string sql = @"
SELECT
  SOZLESMEID AS SozlesmeId,
  PROJEID AS ProjeId,
  PROJEMODULID AS ProjeModulId,
  ADET AS Adet,
  ISKONTO AS Iskonto
FROM SOZLESMEMODUL
WHERE SOZLESMEID = @sozlesmeId
  AND PROJEID = @projeId
  AND PROJEMODULID = @projeModulId;";

        await using var conn = _db.Create();
        var def = new CommandDefinition(sql, new { sozlesmeId, projeId, projeModulId }, cancellationToken: ct);
        return await conn.QuerySingleOrDefaultAsync<SozlesmeModulRow>(def);
    }

    public async Task InsertAsync(InsertSozlesmeModulCommand cmd, CancellationToken ct = default)
    {
        const string sql = @"
INSERT INTO SOZLESMEMODUL (
  SOZLESMEID,
  PROJEID,
  PROJEMODULID,
  ADET,
  ISKONTO
)
VALUES (
  @SozlesmeId,
  @ProjeId,
  @ProjeModulId,
  @Adet,
  @Iskonto
);";

        await using var conn = _db.Create();
        var def = new CommandDefinition(sql, new
        {
            cmd.SozlesmeId,
            cmd.ProjeId,
            cmd.ProjeModulId,
            cmd.Adet,
            cmd.Iskonto
        }, cancellationToken: ct);

        await conn.ExecuteAsync(def);
    }

    public async Task<bool> UpdateAsync(UpdateSozlesmeModulCommand cmd, CancellationToken ct = default)
    {
        const string sql = @"
UPDATE SOZLESMEMODUL
SET
  ADET = @Adet,
  ISKONTO = @Iskonto
WHERE
  SOZLESMEID = @SozlesmeId
  AND PROJEID = @ProjeId
  AND PROJEMODULID = @ProjeModulId;";

        await using var conn = _db.Create();
        var def = new CommandDefinition(sql, new
        {
            cmd.SozlesmeId,
            cmd.ProjeId,
            cmd.ProjeModulId,
            cmd.Adet,
            cmd.Iskonto
        }, cancellationToken: ct);

        var affected = await conn.ExecuteAsync(def);
        return affected == 1;
    }

    public async Task<bool> DeleteAsync(long sozlesmeId, long projeId, long projeModulId, CancellationToken ct = default)
    {
        const string sql = @"
DELETE FROM SOZLESMEMODUL
WHERE SOZLESMEID = @sozlesmeId
  AND PROJEID = @projeId
  AND PROJEMODULID = @projeModulId;";

        await using var conn = _db.Create();
        var def = new CommandDefinition(sql, new { sozlesmeId, projeId, projeModulId }, cancellationToken: ct);
        var affected = await conn.ExecuteAsync(def);
        return affected == 1;
    }
}