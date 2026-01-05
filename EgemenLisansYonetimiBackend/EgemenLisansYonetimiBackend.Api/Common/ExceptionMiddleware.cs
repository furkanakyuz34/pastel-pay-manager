using System.Net;
using System.Text.Json;

namespace EgemenLisansYonetimiBackend.Api.Common;

public sealed class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task Invoke(HttpContext ctx)
    {
        try
        {
            await _next(ctx);
        }
        catch (Exception ex)
        {
            var traceId = ctx.TraceIdentifier;

            _logger.LogError(ex, "Unhandled exception. TraceId={TraceId} Path={Path}", traceId, ctx.Request.Path);

            ctx.Response.ContentType = "application/json";
            ctx.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

            var body = ApiResponse<object>.Fail(
                code: "UNHANDLED",
                detail: "Beklenmeyen bir hata oluştu.",
                message: "Sunucu hatası",
                traceId: traceId
            );

            await ctx.Response.WriteAsync(JsonSerializer.Serialize(body));
        }
    }
}
