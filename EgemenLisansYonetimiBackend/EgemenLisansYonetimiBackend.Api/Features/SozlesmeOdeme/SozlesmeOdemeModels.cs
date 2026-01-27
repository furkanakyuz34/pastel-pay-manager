namespace EgemenLisansYonetimiBackend.Api.Features.SozlesmeOdeme;

public sealed class SozlesmeOdemeDto
{
    public int SozlesmeOdemeId { get; set; }
    public int SozlesmePlaniId { get; set; }
    public int OdemeTipiId { get; set; }
    public int OdemeYontemiId { get; set; }

    public int? PaynetPlanId { get; set; }
    public int? PaynetInvoiceId { get; set; }
    public int? PaynetXactId { get; set; }
    public short? PaynetStatus { get; set; }
    public string? PaynetStatusDesc { get; set; }

    public DateTime? VadeTarihi { get; set; }
    public DateTime? OdemeTarihi { get; set; }
    public short Odendi { get; set; }

    public decimal? Tutar { get; set; }
    public string DovizId { get; set; } = "EURO";

    public string? ReferenceNo { get; set; }
    public string? Aciklama { get; set; }

    public DateTime InsertTarihi { get; set; }
    public int InsertKullaniciId { get; set; }
    public int KullaniciId { get; set; }
    public DateTime DegisimTarihi { get; set; }
}

public sealed class CreateSozlesmeOdemeRequest
{
    public int SozlesmePlaniId { get; set; }
    public int OdemeTipiId { get; set; }
    public int OdemeYontemiId { get; set; }

    public int? PaynetPlanId { get; set; }
    public int? PaynetInvoiceId { get; set; }
    public int? PaynetXactId { get; set; }
    public short? PaynetStatus { get; set; }
    public string? PaynetStatusDesc { get; set; }

    public DateTime? VadeTarihi { get; set; }
    public DateTime? OdemeTarihi { get; set; }
    public short? Odendi { get; set; } // null gelirse DB default(0) kalsın

    public decimal? Tutar { get; set; }
    public string? DovizId { get; set; } // null/empty ise EURO basılacak

    public string? ReferenceNo { get; set; }
    public string? Aciklama { get; set; }
}

public sealed class UpdateSozlesmeOdemeRequest
{
    public int SozlesmeOdemeId { get; set; } // PUT için zorunlu

    public int SozlesmePlaniId { get; set; }
    public int OdemeTipiId { get; set; }
    public int OdemeYontemiId { get; set; }

    public int? PaynetPlanId { get; set; }
    public int? PaynetInvoiceId { get; set; }
    public int? PaynetXactId { get; set; }
    public short? PaynetStatus { get; set; }
    public string? PaynetStatusDesc { get; set; }

    public DateTime? VadeTarihi { get; set; }
    public DateTime? OdemeTarihi { get; set; }
    public short Odendi { get; set; }

    public decimal? Tutar { get; set; }
    public string DovizId { get; set; } = "EURO";

    public string? ReferenceNo { get; set; }
    public string? Aciklama { get; set; }
}

public sealed class SozlesmeOdemeListFilter
{
    public int? SozlesmePlaniId { get; set; }
    public short? Odendi { get; set; }
    public DateTime? VadeBas { get; set; }
    public DateTime? VadeBit { get; set; }
    public int? PaynetInvoiceId { get; set; }
    public int? PaynetXactId { get; set; }
}
