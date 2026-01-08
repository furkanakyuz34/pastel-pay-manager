using Dapper;
using EgemenLisansYonetimiBackend.Api.Common;
using EgemenLisansYonetimiBackend.Api.Infrastructure.Db;
using EgemenLisansYonetimiBackend.Api.Infrastructure.Logging;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace EgemenLisansYonetimiBackend.Api.Features.Doviz;

[ApiController]
[Route("api/dovizkuru")]
[Authorize]
public sealed class DovizKuruController : ControllerBase
{
    private readonly IDbConnectionFactory _db;
    private readonly ILogger<DovizKuruController> _logger;

    public DovizKuruController(IDbConnectionFactory db, ILogger<DovizKuruController> logger)
    {
        _db = db;
        _logger = logger;
    }

    // GET api/dovizkuru/{hareketDovizId}
    [HttpGet("{hareketDovizId}")]
    public async Task<ActionResult<ApiResponse<double>>> Get(string hareketDovizId, CancellationToken ct)
    {
        var traceId = HttpContext.TraceIdentifier;
        var corrId = CorrelationIdMiddleware.Get(HttpContext);

        const string sql = @"
SELECT DovizKuru
FROM EnYakinDovizKuruGetir(@HareketDovizId, NULL, CURRENT_TIMESTAMP(0))
";

        try
        {
            await using var conn = _db.Create();
            var def = new CommandDefinition(sql, new { HareketDovizId = hareketDovizId }, cancellationToken: ct);
            var kuru = await conn.QuerySingleOrDefaultAsync<double?>(def);

            if (kuru is null)
            {
                _logger.LogInformation("DovizKuru.Get not found. HareketDovizId={HareketDovizId} TraceId={TraceId} CorrelationId={CorrelationId}",
                    hareketDovizId, traceId, corrId);

                return NotFound(ApiResponse<double>.Fail("NOT_FOUND", "Döviz kuru bulunamadı.", "Bulunamadı", traceId));
            }

            _logger.LogInformation("DovizKuru.Get succeeded. HareketDovizId={HareketDovizId} Kur={Kur} TraceId={TraceId} CorrelationId={CorrelationId}",
                hareketDovizId, kuru.Value, traceId, corrId);

            return Ok(ApiResponse<double>.Ok(kuru.Value, traceId: traceId));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "DovizKuru.Get exception. HareketDovizId={HareketDovizId} TraceId={TraceId} CorrelationId={CorrelationId}",
                hareketDovizId, traceId, corrId);

            return StatusCode(500, ApiResponse<double>.Fail("UNHANDLED", "Beklenmeyen bir hata oluştu.", ex.Message, traceId));
        }
    }
}