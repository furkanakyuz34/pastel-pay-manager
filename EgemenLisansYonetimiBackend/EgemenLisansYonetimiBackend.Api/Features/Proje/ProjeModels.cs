namespace EgemenLisansYonetimiBackend.Api.Features.Proje;

public sealed record ProjeDto(int ProjeId, string Adi);

public sealed record ProjeCreateRequest(string Adi);

public sealed record ProjeUpdateRequest(string Adi);