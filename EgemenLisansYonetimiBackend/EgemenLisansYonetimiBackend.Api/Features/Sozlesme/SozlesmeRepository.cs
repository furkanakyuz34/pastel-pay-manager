using Dapper;
using EgemenLisansYonetimiBackend.Api.Infrastructure.Db;
using EgemenLisansYonetimiBackend.Api.Features.SozlesmeModul;

namespace EgemenLisansYonetimiBackend.Api.Features.Sozlesme;

public sealed class SozlesmeRepository
{
    private readonly IDbConnectionFactory _db;
    public SozlesmeRepository(IDbConnectionFactory db) => _db = db;

    #region SOZLESME (master) CRUD

    public async Task<long> InsertSozlesmeAsync(InsertSozlesmeCommand cmd, CancellationToken ct = default)
    {
        const string sql = @"
INSERT INTO SOZLESME (
  FIRMAID,
  PROJEID,
  KULLANICISAYISI,
  SATISTARIHI,
  SATISFIYATI,
  DOVIZID,
  LISANSVER,
  OTOMATIKINSTALL,
  SATISKULLANICIID,
  DATASERVERIP,
  STATIKIP,
  KLASOR,
  NOTU,
  ILKSATISTARIHI,
  ILKSATISFIYATI,
  ILKDOVIZID,
  DEMO,
  INSERTTARIHI,
  INSERTKULLANICIID,
  KULLANICIID,
  DEGISIMTARIHI,
  SUBESAYISI,
  ISKONTO
)
VALUES (
  @FirmaId,
  @ProjeId,
  @KullaniciSayisi,
  @SatisTarihi,
  @SatisFiyati,
  @DovizId,
  @LisansVer,
  @OtomatikInstall,
  @SatisKullaniciId,
  @DataServerIp,
  @StatikIp,
  @Klasor,
  @Notu,
  @IlkSatisTarihi,
  @IlkSatisFiyati,
  @IlkDovizId,
  @Demo,
  CURRENT_TIMESTAMP,
  @InsertKullaniciId,
  @KullaniciId,
  CURRENT_TIMESTAMP,
  @SubeSayisi,
  @Iskonto
)
RETURNING SOZLESMEID;
";

        await using var conn = _db.Create();
        var parameters = new
        {
            cmd.FirmaId,
            cmd.ProjeId,
            cmd.KullaniciSayisi,
            cmd.SatisTarihi,
            cmd.SatisFiyati,
            cmd.DovizId,
            // pattern-match so works for bool and bool? and yields short? consistently
            LisansVer = cmd.LisansVer is true ? (short)1 : cmd.LisansVer is false ? (short)0 : (short?)null,
            OtomatikInstall = cmd.OtomatikInstall is true ? (short)1 : cmd.OtomatikInstall is false ? (short)0 : (short?)null,
            // default SATISKULLANICIID to 1 when not provided
            SatisKullaniciId = cmd.SatisKullaniciId ?? 1L,
            cmd.DataServerIp,
            cmd.StatikIp,
            cmd.Klasor,
            cmd.Notu,
            cmd.IlkSatisTarihi,
            cmd.IlkSatisFiyati,
            cmd.IlkDovizId,
            Demo = cmd.Demo is true ? (short)1 : cmd.Demo is false ? (short)0 : (short?)null,
            // keep InsertKullaniciId / KullaniciId as provided (they may be null)
            InsertKullaniciId = cmd.InsertKullaniciId,
            KullaniciId = cmd.KullaniciId,
            cmd.SubeSayisi,
            cmd.Iskonto
        };

        var def = new CommandDefinition(sql, parameters, cancellationToken: ct);
        return await conn.ExecuteScalarAsync<long>(def);
    }

    public async Task<bool> UpdateSozlesmeAsync(UpdateSozlesmeCommand cmd, CancellationToken ct = default)
    {
        const string sql = @"
UPDATE SOZLESME
SET
  FIRMAID = @FirmaId,
  PROJEID = @ProjeId,
  KULLANICISAYISI = @KullaniciSayisi,
  SATISTARIHI = @SatisTarihi,
  SATISFIYATI = @SatisFiyati,
  DOVIZID = @DovizId,
  LISANSVER = @LisansVer,
  OTOMATIKINSTALL = @OtomatikInstall,
  SATISKULLANICIID = @SatisKullaniciId,
  DATASERVERIP = @DataServerIp,
  STATIKIP = @StatikIp,
  KLASOR = @Klasor,
  NOTU = @Notu,
  ILKSATISTARIHI = @IlkSatisTarihi,
  ILKSATISFIYATI = @IlkSatisFiyati,
  ILKDOVIZID = @IlkDovizId,
  DEMO = @Demo,
  DEGISIMTARIHI = CURRENT_TIMESTAMP,
  SUBESAYISI = @SubeSayisi,
  ISKONTO = @Iskonto
WHERE SOZLESMEID = @SozlesmeId;
";

        await using var conn = _db.Create();
        var parameters = new
        {
            cmd.SozlesmeId,
            cmd.FirmaId,
            cmd.ProjeId,
            cmd.KullaniciSayisi,
            cmd.SatisTarihi,
            cmd.SatisFiyati,
            cmd.DovizId,
            LisansVer = cmd.LisansVer is true ? (short)1 : cmd.LisansVer is false ? (short)0 : (short?)null,
            OtomatikInstall = cmd.OtomatikInstall is true ? (short)1 : cmd.OtomatikInstall is false ? (short)0 : (short?)null,
            // ensure SATISKULLANICIID is always sent (default = 1)
            SatisKullaniciId = cmd.SatisKullaniciId ?? 1L,
            cmd.DataServerIp,
            cmd.StatikIp,
            cmd.Klasor,
            cmd.Notu,
            cmd.IlkSatisTarihi,
            cmd.IlkSatisFiyati,
            cmd.IlkDovizId,
            Demo = cmd.Demo is true ? (short)1 : cmd.Demo is false ? (short)0 : (short?)null,
            cmd.SubeSayisi,
            cmd.Iskonto
        };  

        var def = new CommandDefinition(sql, parameters, cancellationToken: ct);
        var affected = await conn.ExecuteAsync(def);
        return affected == 1;
    }

    public async Task DeleteSozlesmeAsync(long sozlesmeId, CancellationToken ct = default)
    {
        const string sql = "DELETE FROM SOZLESME WHERE SOZLESMEID = @sozlesmeId";
        await using var conn = _db.Create();
        var def = new CommandDefinition(sql, new { sozlesmeId }, cancellationToken: ct);
        await conn.ExecuteAsync(def);
    }

    public async Task<SozlesmeRow?> GetSozlesmeAsync(long sozlesmeId, CancellationToken ct = default)
    {
        const string sql = @"
SELECT
  SOZLESMEID AS SozlesmeId,
  FIRMAID AS FirmaId,
  PROJEID AS ProjeId,
  KULLANICISAYISI AS KullaniciSayisi,
  SATISTARIHI AS SatisTarihi,
  SATISFIYATI AS SatisFiyati,
  DOVIZID AS DovizId,
  LISANSVER AS LisansVer,
  OTOMATIKINSTALL AS OtomatikInstall,
  SATISKULLANICIID AS SatisKullaniciId,
  DATASERVERIP AS DataServerIp,
  STATIKIP AS StatikIp,
  KLASOR AS Klasor,
  NOTU AS Notu,
  ILKSATISTARIHI AS IlkSatisTarihi,
  ILKSATISFIYATI AS IlkSatisFiyati,
  ILKDOVIZID AS IlkDovizId,
  DEMO AS Demo,
  INSERTTARIHI AS InsertTarihi,
  INSERTKULLANICIID AS InsertKullaniciId,
  KULLANICIID AS KullaniciId,
  DEGISIMTARIHI AS DegisimTarihi,
  SUBESAYISI AS SubeSayisi,
  ISKONTO AS Iskonto
FROM SOZLESME
WHERE SOZLESMEID = @sozlesmeId;
";
        await using var conn = _db.Create();
        var def = new CommandDefinition(sql, new { sozlesmeId }, cancellationToken: ct);
        return await conn.QuerySingleOrDefaultAsync<SozlesmeRow>(def);
    }

    // New: return all contracts (so controller can return all when no id provided)
    public async Task<IEnumerable<SozlesmeRow>> ListSozlesmeAsync(CancellationToken ct = default)
    {
        const string sql = @"
SELECT
  SOZLESMEID AS SozlesmeId,
  FIRMAID AS FirmaId,
  PROJEID AS ProjeId,
  KULLANICISAYISI AS KullaniciSayisi,
  SATISTARIHI AS SatisTarihi,
  SATISFIYATI AS SatisFiyati,
  DOVIZID AS DovizId,
  LISANSVER AS LisansVer,
  OTOMATIKINSTALL AS OtomatikInstall,
  SATISKULLANICIID AS SatisKullaniciId,
  DATASERVERIP AS DataServerIp,
  STATIKIP AS StatikIp,
  KLASOR AS Klasor,
  NOTU AS Notu,
  ILKSATISTARIHI AS IlkSatisTarihi,
  ILKSATISFIYATI AS IlkSatisFiyati,
  ILKDOVIZID AS IlkDovizId,
  DEMO AS Demo,
  INSERTTARIHI AS InsertTarihi,
  INSERTKULLANICIID AS InsertKullaniciId,
  KULLANICIID AS KullaniciId,
  DEGISIMTARIHI AS DegisimTarihi,
  SUBESAYISI AS SubeSayisi,
  ISKONTO AS Iskonto
FROM SOZLESME
ORDER BY INSERTTARIHI DESC;
";
        await using var conn = _db.Create();
        var def = new CommandDefinition(sql, cancellationToken: ct);
        return await conn.QueryAsync<SozlesmeRow>(def);
    }

    #endregion
}