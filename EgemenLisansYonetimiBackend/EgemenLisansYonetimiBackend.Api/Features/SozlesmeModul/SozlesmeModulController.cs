using EgemenLisansYonetimiBackend.Api.Common;
using EgemenLisansYonetimiBackend.Api.Infrastructure.Logging;
using FirebirdSql.Data.FirebirdClient;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace EgemenLisansYonetimiBackend.Api.Features.SozlesmeModul;

[ApiController]
[Route("api/sozlesme/{sozlesmeId:long}/modul")]
[Authorize]
public sealed class SozlesmeModulController : ControllerBase
{
    private readonly SozlesmeModulRepository _repo;
    private readonly ILogger<SozlesmeModulController> _logger;

    public SozlesmeModulController(SozlesmeModulRepository repo, ILogger<SozlesmeModulController> logger)
    {
        _repo = repo;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<SozlesmeModulRow>>>> List(long sozlesmeId, CancellationToken ct)
    {
        var traceId = HttpContext.TraceIdentifier;
        var corrId = CorrelationIdMiddleware.Get(HttpContext);

        var rows = await _repo.ListAsync(sozlesmeId, ct);
        _logger.LogInformation("SozlesmeModul.List called. SozlesmeId={SozlesmeId} Count={Count} TraceId={TraceId} CorrelationId={CorrelationId}",
            sozlesmeId, rows.Count(), traceId, corrId);

        return Ok(ApiResponse<IEnumerable<SozlesmeModulRow>>.Ok(rows, traceId: traceId));
    }

    [HttpGet("{projeId:long}/{projeModulId:long}")]
    public async Task<ActionResult<ApiResponse<SozlesmeModulRow>>> Get(long sozlesmeId, long projeId, long projeModulId, CancellationToken ct)
    {
        var traceId = HttpContext.TraceIdentifier;
        var corrId = CorrelationIdMiddleware.Get(HttpContext);

        var row = await _repo.GetAsync(sozlesmeId, projeId, projeModulId, ct);
        if (row is null)
        {
            _logger.LogWarning("SozlesmeModul.Get not found. SozlesmeId={SozlesmeId} ProjeId={ProjeId} ProjeModulId={ProjeModulId} TraceId={TraceId} CorrelationId={CorrelationId}",
                sozlesmeId, projeId, projeModulId, traceId, corrId);

            return NotFound(ApiResponse<SozlesmeModulRow>.Fail("NOT_FOUND", "Sözleşme modülü bulunamadı.", "Bulunamadı", traceId));
        }

        _logger.LogInformation("SozlesmeModul.Get succeeded. SozlesmeId={SozlesmeId} ProjeId={ProjeId} ProjeModulId={ProjeModulId} TraceId={TraceId} CorrelationId={CorrelationId}",
            sozlesmeId, projeId, projeModulId, traceId, corrId);

        return Ok(ApiResponse<SozlesmeModulRow>.Ok(row, traceId: traceId));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<object>>> Create(long sozlesmeId, [FromBody] InsertSozlesmeModulCommand req, CancellationToken ct)
    {
        var traceId = HttpContext.TraceIdentifier;
        var corrId = CorrelationIdMiddleware.Get(HttpContext);

        if (req.SozlesmeId != sozlesmeId)
        {
            _logger.LogWarning("SozlesmeModul.Create bad request. RouteId={RouteId} BodyId={BodyId} TraceId={TraceId} CorrelationId={CorrelationId}",
                sozlesmeId, req.SozlesmeId, traceId, corrId);

            return BadRequest(ApiResponse<object>.Fail("INVALID_REQUEST", "SozlesmeId uyuşmuyor.", "SozlesmeId uyuşmuyor", traceId));
        }

        try
        {
            await _repo.InsertAsync(req, ct);
        }
        catch (FbException ex)
        {
            // Unknown column / schema mismatch -> return clear client error
            if (ex.Message.Contains("Column unknown", StringComparison.OrdinalIgnoreCase) ||
                ex.Message.Contains("validation error", StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogWarning(ex, "SozlesmeModul.Create DB schema issue. SozlesmeId={SozlesmeId} TraceId={TraceId} CorrelationId={CorrelationId}",
                    sozlesmeId, traceId, corrId);

                return BadRequest(ApiResponse<object>.Fail("DB_SCHEMA_ERROR", "Veritabanı şeması beklenenden farklı.", ex.Message, traceId));
            }

            // Other DB-level business rule (trigger) -> pass as business error
            _logger.LogWarning(ex, "SozlesmeModul.Create DB error. SozlesmeId={SozlesmeId} TraceId={TraceId} CorrelationId={CorrelationId}",
                sozlesmeId, traceId, corrId);

            return BadRequest(ApiResponse<object>.Fail("DB_ERROR", ex.Message, "İş kuralı ihlali", traceId));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SozlesmeModul.Create exception. SozlesmeId={SozlesmeId} TraceId={TraceId} CorrelationId={CorrelationId}",
                sozlesmeId, traceId, corrId);
            return StatusCode(500, ApiResponse<object>.Fail("UNHANDLED", "Beklenmeyen bir hata oluştu.", ex.Message, traceId));
        }

        _logger.LogInformation("SozlesmeModul.Create succeeded. SozlesmeId={SozlesmeId} ProjeId={ProjeId} ProjeModulId={ProjeModulId} TraceId={TraceId} CorrelationId={CorrelationId}",
            req.SozlesmeId, req.ProjeId, req.ProjeModulId, traceId, corrId);

        return Ok(ApiResponse<object>.Ok(new { }, "Sözleşme modülü eklendi", traceId));
    }

    [HttpPut("{projeId:long}/{projeModulId:long}")]
    public async Task<ActionResult<ApiResponse<object>>> Update(long sozlesmeId, long projeId, long projeModulId, [FromBody] UpdateSozlesmeModulCommand req, CancellationToken ct)
    {
        var traceId = HttpContext.TraceIdentifier;
        var corrId = CorrelationIdMiddleware.Get(HttpContext);

        if (req.SozlesmeId != sozlesmeId || req.ProjeId != projeId || req.ProjeModulId != projeModulId)
        {
            _logger.LogWarning("SozlesmeModul.Update bad request. RouteKeys mismatch. TraceId={TraceId} CorrelationId={CorrelationId}",
                traceId, corrId);

            return BadRequest(ApiResponse<object>.Fail("INVALID_REQUEST", "Route ve body anahtarları uyuşmuyor.", "Anahtar uyuşmuyor", traceId));
        }

        try
        {
            var ok = await _repo.UpdateAsync(req, ct);
            if (!ok)
            {
                _logger.LogWarning("SozlesmeModul.Update not found. SozlesmeId={SozlesmeId} ProjeId={ProjeId} ProjeModulId={ProjeModulId} TraceId={TraceId} CorrelationId={CorrelationId}",
                    sozlesmeId, projeId, projeModulId, traceId, corrId);

                return NotFound(ApiResponse<object>.Fail("NOT_FOUND", "Sözleşme modülü bulunamadı.", "Bulunamadı", traceId));
            }
        }
        catch (FbException ex)
        {
            // Trigger-based business rule (licensed module cannot change)
            _logger.LogWarning(ex, "SozlesmeModul.Update trigger/DB error. SozlesmeId={SozlesmeId} TraceId={TraceId} CorrelationId={CorrelationId}",
                sozlesmeId, traceId, corrId);

            return BadRequest(ApiResponse<object>.Fail("BUSINESS_RULE", ex.Message, "İş kuralı ihlali", traceId));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SozlesmeModul.Update exception. SozlesmeId={SozlesmeId} TraceId={TraceId} CorrelationId={CorrelationId}",
                sozlesmeId, traceId, corrId);
            return StatusCode(500, ApiResponse<object>.Fail("UNHANDLED", "Beklenmeyen bir hata oluştu.", ex.Message, traceId));
        }

        _logger.LogInformation("SozlesmeModul.Update succeeded. SozlesmeId={SozlesmeId} ProjeId={ProjeId} ProjeModulId={ProjeModulId} TraceId={TraceId} CorrelationId={CorrelationId}",
            sozlesmeId, projeId, projeModulId, traceId, corrId);

        return Ok(ApiResponse<object>.Ok(new { }, "Sözleşme modülü güncellendi", traceId));
    }

    [HttpDelete("{projeId:long}/{projeModulId:long}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(long sozlesmeId, long projeId, long projeModulId, CancellationToken ct)
    {
        var traceId = HttpContext.TraceIdentifier;
        var corrId = CorrelationIdMiddleware.Get(HttpContext);

        try
        {
            var ok = await _repo.DeleteAsync(sozlesmeId, projeId, projeModulId, ct);
            if (!ok)
            {
                _logger.LogWarning("SozlesmeModul.Delete not found. SozlesmeId={SozlesmeId} ProjeId={ProjeId} ProjeModulId={ProjeModulId} TraceId={TraceId} CorrelationId={CorrelationId}",
                    sozlesmeId, projeId, projeModulId, traceId, corrId);

                return NotFound(ApiResponse<object>.Fail("NOT_FOUND", "Sözleşme modülü bulunamadı.", "Bulunamadı", traceId));
            }
        }
        catch (FbException ex)
        {
            // Trigger prohibits delete of licensed modules
            _logger.LogWarning(ex, "SozlesmeModul.Delete trigger/DB error. SozlesmeId={SozlesmeId} TraceId={TraceId} CorrelationId={CorrelationId}",
                sozlesmeId, traceId, corrId);

            return BadRequest(ApiResponse<object>.Fail("BUSINESS_RULE", ex.Message, "İş kuralı ihlali", traceId));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "SozlesmeModul.Delete exception. SozlesmeId={SozlesmeId} TraceId={TraceId} CorrelationId={CorrelationId}",
                sozlesmeId, traceId, corrId);
            return StatusCode(500, ApiResponse<object>.Fail("UNHANDLED", "Beklenmeyen bir hata oluştu.", ex.Message, traceId));
        }

        _logger.LogInformation("SozlesmeModul.Delete succeeded. SozlesmeId={SozlesmeId} ProjeId={ProjeId} ProjeModulId={ProjeModulId} TraceId={TraceId} CorrelationId={CorrelationId}",
            sozlesmeId, projeId, projeModulId, traceId, corrId);

        return Ok(ApiResponse<object>.Ok(new { }, "Sözleşme modülü silindi", traceId));
    }
}