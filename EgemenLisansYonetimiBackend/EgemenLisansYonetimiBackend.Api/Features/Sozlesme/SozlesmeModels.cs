using System;

namespace EgemenLisansYonetimiBackend.Api.Features.Sozlesme
{
    // Sozlesme (master) models used by SozlesmeRepository

    public sealed record InsertSozlesmeCommand
    {
        public long? FirmaId { get; init; }
        public long? ProjeId { get; init; }
        public int? KullaniciSayisi { get; init; }
        public DateTime? SatisTarihi { get; init; }
        public decimal? SatisFiyati { get; init; }
        // changed to string to accept currency codes like "USD"
        public string? DovizId { get; init; }
        public bool? LisansVer { get; init; }
        public bool? OtomatikInstall { get; init; }
        public long? SatisKullaniciId { get; init; }
        public string? DataServerIp { get; init; }
        public string? StatikIp { get; init; }
        public string? Klasor { get; init; }
        public string? Notu { get; init; }
        public DateTime? IlkSatisTarihi { get; init; }
        public decimal? IlkSatisFiyati { get; init; }
        // changed to string to accept currency codes like "USD"
        public string? IlkDovizId { get; init; }
        public bool? Demo { get; init; }
        public long? InsertKullaniciId { get; init; }
        public long? KullaniciId { get; init; }
        public DateTime? DegisimTarihi { get; init; }
        public int? SubeSayisi { get; init; }
        public decimal? Iskonto { get; init; }
    }

    public sealed record UpdateSozlesmeCommand
    {
        public long SozlesmeId { get; init; }
        public long? FirmaId { get; init; }
        public long? ProjeId { get; init; }
        public int? KullaniciSayisi { get; init; }   
        public DateTime? SatisTarihi { get; init; }
        public decimal? SatisFiyati { get; init; }
        // changed to string
        public string? DovizId { get; init; }
        public bool? LisansVer { get; init; }
        public bool? OtomatikInstall { get; init; }
        public long? SatisKullaniciId { get; init; }
        public string? DataServerIp { get; init; }
        public string? StatikIp { get; init; }
        public string? Klasor { get; init; }
        public string? Notu { get; init; }
        public DateTime? IlkSatisTarihi { get; init; }
        public decimal? IlkSatisFiyati { get; init; }
        // changed to string
        public string? IlkDovizId { get; init; }
        public bool Demo { get; init; }
        public int? SubeSayisi { get; init; }
        public decimal? Iskonto { get; init; }
    }

    public sealed record SozlesmeRow
    {
        public long SozlesmeId { get; init; }
        public long FirmaId { get; init; }
        public long ProjeId { get; init; }
        public int KullaniciSayisi { get; init; }
        public DateTime? SatisTarihi { get; init; }
        public decimal? SatisFiyati { get; init; }
        // changed to string to match DB values like "USD"
        public string? DovizId { get; init; }
        public short LisansVer { get; init; }
        public short OtomatikInstall { get; init; }
        public long? SatisKullaniciId { get; init; }
        public string? DataServerIp { get; init; }
        public string? StatikIp { get; init; }
        public string? Klasor { get; init; }
        public string? Notu { get; init; }
        public DateTime? IlkSatisTarihi { get; init; }
        public decimal? IlkSatisFiyati { get; init; }
        // changed to string
        public string? IlkDovizId { get; init; }
        public short Demo { get; init; }
        public DateTime InsertTarihi { get; init; }
        public long InsertKullaniciId { get; init; }
        public long KullaniciId { get; init; }
        public DateTime? DegisimTarihi { get; init; }
        public int? SubeSayisi { get; init; }
        public decimal? Iskonto { get; init; }
    }
}