namespace EgemenLisansYonetimiBackend.Api.Features.Firma;

public sealed record FirmaDto(
    int FirmaId,
    string Adi,
    string? YetkiliAdi,
    string? Adres1,
    string? Adres2,
    string? Adres3,
    string? Semt,
    string? Sehir,
    string? VergiDairesi,
    string? VergiHesapNo,
    string? Telefon1,
    string? Telefon2,
    string? Fax,
    string? Email,
    string? Notu
);

public sealed record FirmaCreateRequest(
    int FirmaId,
    string Adi,
    string? YetkiliAdi,
    string? Adres1,
    string? Adres2,
    string? Adres3,
    string? Semt,
    string? Sehir,
    string? VergiDairesi,
    string? VergiHesapNo,
    string? Telefon1,
    string? Telefon2,
    string? Fax,
    string? Email,
    string? Notu
);

public sealed record FirmaUpdateRequest(
    string Adi,
    string? YetkiliAdi,
    string? Adres1,
    string? Adres2,
    string? Adres3,
    string? Semt,
    string? Sehir,
    string? VergiDairesi,
    string? VergiHesapNo,
    string? Telefon1,
    string? Telefon2,
    string? Fax,
    string? Email,
    string? Notu
);
