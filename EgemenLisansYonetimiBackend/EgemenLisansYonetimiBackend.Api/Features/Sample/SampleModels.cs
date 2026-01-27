namespace EgemenLisansYonetimiBackend.Api.Features.Sample;

public sealed class HelloWorldResponse
{
    public string Message { get; set; } = default!;
    public long? UserId { get; set; }
}