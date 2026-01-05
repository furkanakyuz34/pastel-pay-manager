namespace EgemenLisansYonetimiBackend.Api.Common;

public sealed class ApiError
{
    public string Code { get; init; } = "UNKNOWN";
    public string? Detail { get; init; }
}
