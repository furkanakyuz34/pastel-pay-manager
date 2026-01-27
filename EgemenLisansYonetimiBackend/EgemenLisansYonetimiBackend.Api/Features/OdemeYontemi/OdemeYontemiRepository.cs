using Dapper;
using EgemenLisansYonetimiBackend.Api.Infrastructure.Db;

namespace EgemenLisansYonetimiBackend.Api.Features.OdemeYontemi;

public sealed class OdemeYontemiRepository
{
    private readonly IDbConnectionFactory _db;
    public OdemeYontemiRepository(IDbConnectionFactory db) => _db = db;

    public async Task<IReadOnlyList<OdemeYontemiDto>> ListAsync()
    {
        const string sql = @"
        SELECT
            OdemeYontemiId,
            ADI as Adi
        FROM OdemeYontemi
        ORDER BY ADI";

        await using var conn = _db.Create();
        var rows = await conn.QueryAsync<OdemeYontemiDto>(sql);
        return rows.AsList();
    }
}
