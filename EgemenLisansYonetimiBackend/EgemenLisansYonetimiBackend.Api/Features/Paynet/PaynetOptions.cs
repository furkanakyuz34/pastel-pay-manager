namespace EgemenLisansYonetimiBackend.Api.Features.Paynet;

public class PaynetOptions
{
    public string BaseUrl { get; set; } = default!;
    public string SecretKey { get; set; } = default!;
    public int TimeoutSeconds { get; set; } = 30;
}
