using Dapper;
using EgemenLisansYonetimiBackend.Api.Infrastructure.Db;

namespace EgemenLisansYonetimiBackend.Api.Features.Firma;

public sealed class FirmaRepository
{
    private readonly IDbConnectionFactory _db;
    public FirmaRepository(IDbConnectionFactory db) => _db = db;

    public async Task<IReadOnlyList<FirmaDto>> ListAsync()
    {
        const string sql = @"
SELECT
  FIRMAID as FirmaId,
  ADI as Adi,
  YETKILIADI as YetkiliAdi,
  ADRESI1 as Adres1,
  ADRESI2 as Adres2,
  ADRESI3 as Adres3,
  SEMT as Semt,
  SEHIR as Sehir,
  VERGIDAIRESI as VergiDairesi,
  VERGIHESAPNO as VergiHesapNo,
  TELEFON1 as Telefon1,
  TELEFON2 as Telefon2,
  FAX as Fax,
  EMAIL as Email,
  NOTU as Notu
FROM FIRMA
ORDER BY ADI";

        await using var conn = _db.Create();
        var rows = await conn.QueryAsync<FirmaDto>(sql);
        return rows.AsList();
    }

    public async Task<FirmaDto?> GetAsync(int firmaId)
    {
        const string sql = @"
SELECT
  FIRMAID as FirmaId,
  ADI as Adi,
  YETKILIADI as YetkiliAdi,
  ADRESI1 as Adres1,
  ADRESI2 as Adres2,
  ADRESI3 as Adres3,
  SEMT as Semt,
  SEHIR as Sehir,
  VERGIDAIRESI as VergiDairesi,
  VERGIHESAPNO as VergiHesapNo,
  TELEFON1 as Telefon1,
  TELEFON2 as Telefon2,
  FAX as Fax,
  EMAIL as Email,
  NOTU as Notu
FROM FIRMA
WHERE FIRMAID = @firmaId";

        await using var conn = _db.Create();
        return await conn.QuerySingleOrDefaultAsync<FirmaDto>(sql, new { firmaId });
    }

    public async Task<int> CreateAsync(FirmaCreateRequest req, int userId)
    {
        const string sql = @"
INSERT INTO FIRMA
(ADI, YETKILIADI, ADRESI1, ADRESI2, ADRESI3, SEMT, SEHIR,
 VERGIDAIRESI, VERGIHESAPNO, TELEFON1, TELEFON2, FAX, EMAIL, NOTU,
 INSERTTARIHI, INSERTKULLANICIID, KULLANICIID)
VALUES
(@Adi, @YetkiliAdi, @Adres1, @Adres2, @Adres3, @Semt, @Sehir,
 @VergiDairesi, @VergiHesapNo, @Telefon1, @Telefon2, @Fax, @Email, @Notu,
 CURRENT_TIMESTAMP, @UserId, @UserId)
RETURNING FIRMAID;
";

        await using var conn = _db.Create();
        return await conn.ExecuteScalarAsync<int>(sql, new
        {
            req.Adi,
            req.YetkiliAdi,
            req.Adres1,
            req.Adres2,
            req.Adres3,
            req.Semt,
            req.Sehir,
            req.VergiDairesi,
            req.VergiHesapNo,
            req.Telefon1,
            req.Telefon2,
            req.Fax,
            req.Email,
            req.Notu,
            UserId = userId
        });
    }

    public async Task<bool> UpdateAsync(int firmaId, FirmaUpdateRequest req, int userId)
    {
        const string sql = @"
UPDATE FIRMA SET
  ADI = @Adi,
  YETKILIADI = @YetkiliAdi,
  ADRESI1 = @Adres1,
  ADRESI2 = @Adres2,
  ADRESI3 = @Adres3,
  SEMT = @Semt,
  SEHIR = @Sehir,
  VERGIDAIRESI = @VergiDairesi,
  VERGIHESAPNO = @VergiHesapNo,
  TELEFON1 = @Telefon1,
  TELEFON2 = @Telefon2,
  FAX = @Fax,
  EMAIL = @Email,
  NOTU = @Notu,
  DEGISIMTARIHI = CURRENT_TIMESTAMP,
  KULLANICIID = @UserId
WHERE FIRMAID = @FirmaId;";

        await using var conn = _db.Create();
        var affected = await conn.ExecuteAsync(sql, new
        {
            FirmaId = firmaId,
            req.Adi,
            req.YetkiliAdi,
            req.Adres1,
            req.Adres2,
            req.Adres3,
            req.Semt,
            req.Sehir,
            req.VergiDairesi,
            req.VergiHesapNo,
            req.Telefon1,
            req.Telefon2,
            req.Fax,
            req.Email,
            req.Notu,
            UserId = userId
        });

        return affected == 1;
    }

    public async Task<bool> DeleteAsync(int firmaId)
    {
        // Eğer FK varsa önce projeler/modüller engel olur. İstersen soft delete yaparız.
        const string sql = @"DELETE FROM FIRMA WHERE FIRMAID = @firmaId";
        await using var conn = _db.Create();
        var affected = await conn.ExecuteAsync(sql, new { firmaId });
        return affected == 1;
    }
}
