namespace EgemenLisansYonetimiBackend.Api.Features.Auth
{
    public sealed record LoginRequest(int KullaniciId, string Sifre);

    public sealed record LoginResponse(string AccessToken);

    public sealed record MeResponse(int KullaniciId, string Adi);


}
