using System;

namespace EgemenLisansYonetimiBackend.Api.Features.SozlesmePlani
{
    public sealed record InsertSozlesmePlaniCommand
    {
        public long SozlesmeId { get; init; }
        public int PlanId { get; init; }
        public decimal? GenelIskonto { get; init; }
        public decimal? AbonelikIskonto { get; init; }
        public DateTime? AbonelikBaslangicTarihi { get; init; }
        public decimal? PesinatTutari { get; init; }
        public decimal? AbonelikUcreti { get; init; }
        public string? DovizId { get; init; } = "EURO";
        public long? InsertKullaniciId { get; init; } = 1;
        public long? KullaniciId { get; init; } = 1;
    }

    public sealed record UpdateSozlesmePlaniCommand
    {
        public long SozlesmePlanId { get; init; }
        public int? PlanId { get; init; }
        public decimal? GenelIskonto { get; init; }
        public decimal? AbonelikIskonto { get; init; }
        public DateTime? AbonelikBaslangicTarihi { get; init; }
        public decimal? PesinatTutari { get; init; }
        public decimal? AbonelikUcreti { get; init; }
        public string? DovizId { get; init; }
    }

    public sealed record SozlesmePlaniRow
    {
        public long SozlesmePlanId { get; init; }
        public long SozlesmeId { get; init; }
        public int PlanId { get; init; }
        public decimal? GenelIskonto { get; init; }
        public decimal? AbonelikIskonto { get; init; }
        public DateTime? AbonelikBaslangicTarihi { get; init; }
        public decimal? PesinatTutari { get; init; }
        public decimal? AbonelikUcreti { get; init; }
        public string DovizId { get; init; } = "EURO";
        public DateTime InsertTarihi { get; init; }
        public long InsertKullaniciId { get; init; }
        public long KullaniciId { get; init; }
        public DateTime DegisimTarihi { get; init; }
    }

    public sealed record SozlesmePlaniUcretRow
    {
        public decimal? ToplamTutar { get; init; }
        public decimal? PesinatTutari { get; init; }
        public decimal? AbonelikUcreti { get; init; }
    }
}