using Serilog.Context;

namespace EgemenLisansYonetimiBackend.Api.Infrastructure.Logging;


public sealed class CorrelationIdMiddleware
{
    public const string HeaderName = "X-Correlation-Id";
    private readonly RequestDelegate _next;

    public CorrelationIdMiddleware(RequestDelegate next) => _next = next;

    public async Task Invoke(HttpContext ctx)
    {
        var cid = ctx.Request.Headers.TryGetValue(HeaderName, out var v) && !string.IsNullOrWhiteSpace(v)
            ? v.ToString()
            : Guid.NewGuid().ToString("N");

        ctx.Items[HeaderName] = cid;
        ctx.Response.Headers[HeaderName] = cid;

        // ✅ Serilog’a ekle (loglarda {CorrelationId} olarak gözükecek)
        using (LogContext.PushProperty("CorrelationId", cid))
        {
            await _next(ctx);
        }
    }

    public static string? Get(HttpContext ctx)
        => ctx.Items.TryGetValue(HeaderName, out var v) ? v?.ToString() : null;
}