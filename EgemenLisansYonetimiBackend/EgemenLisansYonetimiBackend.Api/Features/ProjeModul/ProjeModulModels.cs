namespace EgemenLisansYonetimiBackend.Api.Features.ProjeModul;

public sealed record ProjeModulDto(int ProjeModulId, int ProjeId, string Adi, double BirimFiyat,string DovizId,int ModulTipi);

public sealed record ProjeModulCreateRequest(int ProjeId, string Adi, double BirimFiyat, string DovizId, int ModulTipi);
public sealed record ProjeModulUpdateRequest(string Adi, double BirimFiyat, string DovizId, int ModulTipi);