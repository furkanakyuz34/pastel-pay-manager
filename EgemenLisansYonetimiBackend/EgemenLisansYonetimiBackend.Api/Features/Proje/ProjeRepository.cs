using Dapper;
using EgemenLisansYonetimiBackend.Api.Infrastructure.Db;

namespace EgemenLisansYonetimiBackend.Api.Features.Proje;

public sealed class ProjeRepository
{
    private readonly IDbConnectionFactory _db;
    public ProjeRepository(IDbConnectionFactory db) => _db = db;

    public async Task<IReadOnlyList<ProjeDto>> ListAsync()
    {
        const string sql = @"
SELECT PROJEID as ProjeId, ADI as Adi
FROM PROJE
ORDER BY ADI";

        await using var conn = _db.Create();
        var rows = await conn.QueryAsync<ProjeDto>(sql);
        return rows.AsList();
    }

    public async Task<ProjeDto?> GetAsync(int projeId)
    {
        const string sql = @"
SELECT PROJEID as ProjeId, ADI as Adi
FROM PROJE
WHERE PROJEID = @projeId";

        await using var conn = _db.Create();
        return await conn.QuerySingleOrDefaultAsync<ProjeDto>(sql, new { projeId });
    }

    public async Task<int> CreateAsync(ProjeCreateRequest req)
    {
        const string sql = @"
INSERT INTO PROJE (ADI)
VALUES (@Adi)
RETURNING PROJEID;";

        await using var conn = _db.Create();
        return await conn.ExecuteScalarAsync<int>(sql, req);
    }

    public async Task<bool> UpdateAsync(int projeId, ProjeUpdateRequest req)
    {
        const string sql = @"
UPDATE PROJE SET
  ADI = @Adi
WHERE PROJEID = @projeId";

        await using var conn = _db.Create();
        var affected = await conn.ExecuteAsync(sql, new { projeId, req.Adi });
        return affected == 1;
    }

    public async Task<bool> DeleteAsync(int projeId)
    {
        // PROJEMODUL FK varsa önce modüller silinmeli.
        const string sql = @"DELETE FROM PROJE WHERE PROJEID = @projeId";

        await using var conn = _db.Create();
        var affected = await conn.ExecuteAsync(sql, new { projeId });
        return affected == 1;
    }
}
