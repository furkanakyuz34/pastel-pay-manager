namespace EgemenLisansYonetimiBackend.Api.Features.ProjeModul;

public sealed record ProjeModulDto(int ProjeModulId, int ProjeId, string Adi);

public sealed record ProjeModulCreateRequest(int ProjeId, string Adi);
public sealed record ProjeModulUpdateRequest(string Adi);
