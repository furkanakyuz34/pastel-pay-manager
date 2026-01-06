
namespace EgemenLisansYonetimiBackend.Api.Features.SozlesmeModul
{
    // SozlesmeModul models (moved to separate namespace)

    public sealed record InsertSozlesmeModulCommand
    {
        public long SozlesmeId { get; init; }
        public long ProjeId { get; init; }
        public long ProjeModulId { get; init; }
        public int Adet { get; init; }
        public decimal? Iskonto { get; init; }
        public long InsertKullaniciId { get; init; }
        public long KullaniciId { get; init; }
    }

    public sealed record UpdateSozlesmeModulCommand
    {
        public long SozlesmeId { get; init; }
        public long ProjeId { get; init; }
        public long ProjeModulId { get; init; }
        public int Adet { get; init; }
        public decimal? Iskonto { get; init; }
    }

    public sealed record SozlesmeModulRow
    {
        public long SozlesmeId { get; init; }
        public long ProjeId { get; init; }
        public long ProjeModulId { get; init; }
        public int Adet { get; init; }
        public decimal? Iskonto { get; init; }
    }
}