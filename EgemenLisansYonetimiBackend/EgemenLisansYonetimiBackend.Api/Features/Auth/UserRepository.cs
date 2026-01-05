using Dapper;
using EgemenLisansYonetimiBackend.Api.Infrastructure.Db;

namespace EgemenLisansYonetimiBackend.Api.Features.Auth;

public sealed class UserRepository
{
    private readonly IDbConnectionFactory _db;
    public UserRepository(IDbConnectionFactory db) => _db = db;

    public async Task<UserRow?> GetByIdAndPasswordAsync(int kullaniciId, string sifre)
    {
        const string sql = @"
SELECT 
    KullaniciId,
    Adi,
    Sifre
FROM Kullanici
WHERE KullaniciId = @kullaniciId
  AND Sifre = @sifre";

        await using var conn = _db.Create();
        return await conn.QuerySingleOrDefaultAsync<UserRow>(sql, new
        {
            kullaniciId,
            sifre
        });
    }
}

public sealed record UserRow
{
    public int KullaniciId { get; init; }
    public string Adi { get; init; } = default!;
    public string Sifre { get; init; } = default!;
}
