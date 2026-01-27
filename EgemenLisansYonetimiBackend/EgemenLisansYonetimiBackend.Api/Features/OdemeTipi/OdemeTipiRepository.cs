using Dapper;
using EgemenLisansYonetimiBackend.Api.Infrastructure.Db;

namespace EgemenLisansYonetimiBackend.Api.Features.OdemeTipi;

public sealed class OdemeTipiRepository
{
    private readonly IDbConnectionFactory _db;
    public OdemeTipiRepository(IDbConnectionFactory db) => _db = db;

    public async Task<IReadOnlyList<OdemeTipiDto>> ListAsync()
    {
        const string sql = @"
        SELECT
            OdemeTipiId,
            ADI as Adi
        FROM OdemeTipi
        ORDER BY ADI";

        await using var conn = _db.Create();
        var rows = await conn.QueryAsync<OdemeTipiDto>(sql);
        return rows.AsList();
    }
}
