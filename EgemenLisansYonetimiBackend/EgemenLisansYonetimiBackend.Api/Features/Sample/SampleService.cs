using System.Security.Claims;

namespace EgemenLisansYonetimiBackend.Api.Features.Sample;

public sealed class SampleService
{
    private readonly IHttpContextAccessor _http;

    public SampleService(IHttpContextAccessor http)
    {
        _http = http;
    }

    public HelloWorldResponse HelloWorld()
    {
        var user = _http.HttpContext?.User;

        var userIdStr =
            user?.FindFirstValue(ClaimTypes.NameIdentifier) ??
            user?.FindFirstValue("sub") ??
            user?.FindFirstValue("userId");

        long? userId = null;
        if (!string.IsNullOrWhiteSpace(userIdStr) && long.TryParse(userIdStr, out var parsed))
            userId = parsed;

        return new HelloWorldResponse
        {
            Message = "Hello World",
            UserId = userId
        };
    }
}
