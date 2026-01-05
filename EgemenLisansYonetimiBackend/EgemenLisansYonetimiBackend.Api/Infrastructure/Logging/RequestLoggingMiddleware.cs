using System.Diagnostics;

namespace EgemenLisansYonetimiBackend.Api.Infrastructure.Logging;

public sealed class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task Invoke(HttpContext ctx)
    {
        var sw = Stopwatch.StartNew();

        try
        {
            await _next(ctx);
        }
        finally
        {
            sw.Stop();

            var cid = CorrelationIdMiddleware.Get(ctx);
            _logger.LogInformation(
                "HTTP {Method} {Path} => {StatusCode} in {ElapsedMs}ms | TraceId={TraceId} | CorrelationId={CorrelationId}",
                ctx.Request.Method,
                ctx.Request.Path,
                ctx.Response.StatusCode,
                sw.ElapsedMilliseconds,
                ctx.TraceIdentifier,
                cid
            );
        }
    }
}
