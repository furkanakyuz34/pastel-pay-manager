using Dapper;
using EgemenLisansYonetimiBackend.Api.Infrastructure.Db;

namespace EgemenLisansYonetimiBackend.Api.Features.ProjeModul;

public sealed class ProjeModulRepository
{
    private readonly IDbConnectionFactory _db;
    public ProjeModulRepository(IDbConnectionFactory db) => _db = db;

    public async Task<IReadOnlyList<ProjeModulDto>> ListAsync(int? projeId = null)
    {
        var sql = @"
            SELECT PROJEMODULID as ProjeModulId, PROJEID as ProjeId, ADI as Adi, BIRIMFIYAT as BirimFiyat , DovizId, ModulTipi
            FROM PROJEMODUL
            /**where**/
            ORDER BY ADI";

        var where = "";
        object param = new { };

        if (projeId.HasValue)
        {
            where = "WHERE PROJEID = @projeId";
            param = new { projeId };
        }

        sql = sql.Replace("/**where**/", where);

        await using var conn = _db.Create();
        var rows = await conn.QueryAsync<ProjeModulDto>(sql, param);
        return rows.AsList();
    }

    public async Task<ProjeModulDto?> GetAsync(int projeModulId)
    {
        const string sql = @"
        SELECT FIRST 1 PROJEMODULID as ProjeModulId, PROJEID as ProjeId, ADI as Adi, BIRIMFIYAT as BirimFiyat, DovizId, ModulTipi
        FROM PROJEMODUL
        WHERE PROJEMODULID = @projeModulId";

        await using var conn = _db.Create();
        return await conn.QuerySingleOrDefaultAsync<ProjeModulDto>(sql, new { projeModulId });
    }

    public async Task<int> CreateAsync(ProjeModulCreateRequest req)
    {
        const string sql = @"
        INSERT INTO PROJEMODUL (PROJEID, ADI, BIRIMFIYAT, DovizId, ModulTipi)
        VALUES (@ProjeId, @Adi, @BirimFiyat, @DovizId, @ModulTipi)
        RETURNING PROJEMODULID;";

        await using var conn = _db.Create();
        return await conn.ExecuteScalarAsync<int>(sql, req);
    }

    public async Task<bool> UpdateAsync(int projeModulId, ProjeModulUpdateRequest req)
    {
        const string sql = @"
        UPDATE PROJEMODUL SET
          ADI = @Adi,
          BIRIMFIYAT = @BirimFiyat,
          DovizId = @DovizId,
          ModulTipi = @ModulTipi
        WHERE PROJEMODULID = @projeModulId";

        await using var conn = _db.Create();
        var affected = await conn.ExecuteAsync(sql, new { projeModulId, req.Adi, req.BirimFiyat, req.DovizId, req.ModulTipi });
        return affected == 1;
    }

    public async Task<bool> DeleteAsync(int projeModulId)
    {
        const string sql = @"DELETE FROM PROJEMODUL WHERE PROJEMODULID = @projeModulId";
        await using var conn = _db.Create();
        var affected = await conn.ExecuteAsync(sql, new { projeModulId });
        return affected == 1;
    }
}