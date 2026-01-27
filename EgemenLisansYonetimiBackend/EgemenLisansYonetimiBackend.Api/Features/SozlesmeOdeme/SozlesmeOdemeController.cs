using EgemenLisansYonetimiBackend.Api.Common;
using EgemenLisansYonetimiBackend.Api.Infrastructure.Logging;
using FirebirdSql.Data.FirebirdClient;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace EgemenLisansYonetimiBackend.Api.Features.SozlesmeOdeme;

[ApiController]
[Route("api/sozlesme-plani/{sozlesmePlaniId:long}/odeme")]
[Authorize]
public sealed class SozlesmeOdemeController : ControllerBase
{
    private readonly SozlesmeOdemeRepository _repo;
    private readonly ILogger<SozlesmeOdemeController> _logger;

    public SozlesmeOdemeController(SozlesmeOdemeRepository repo, ILogger<SozlesmeOdemeController> logger)
    {
        _repo = repo;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<SozlesmeOdemeDto>>>> List(long sozlesmePlaniId, CancellationToken ct)
    {
        var traceId = HttpContext.TraceIdentifier;
        var corrId = CorrelationIdMiddleware.Get(HttpContext);

        var rows = await _repo.ListAsync((int)sozlesmePlaniId);
        _logger.LogInformation(
            "SozlesmeOdeme.List called. SozlesmePlaniId={SozlesmePlaniId} Count={Count} TraceId={TraceId} CorrelationId={CorrelationId}",
            sozlesmePlaniId, rows.Count(), traceId, corrId);

        return Ok(ApiResponse<IEnumerable<SozlesmeOdemeDto>>.Ok(rows, traceId: traceId));
    }

    [HttpGet("{sozlesmeOdemeId:int}")]
    public async Task<ActionResult<ApiResponse<SozlesmeOdemeDto>>> Get(long sozlesmePlaniId, int sozlesmeOdemeId, CancellationToken ct)
    {
        var traceId = HttpContext.TraceIdentifier;
        var corrId = CorrelationIdMiddleware.Get(HttpContext);

        var row = await _repo.GetAsync(sozlesmeOdemeId);
        if (row is null || row.SozlesmePlaniId != (int)sozlesmePlaniId)
        {
            _logger.LogWarning(
                "SozlesmeOdeme.Get not found. SozlesmePlaniId={SozlesmePlaniId} SozlesmeOdemeId={SozlesmeOdemeId} TraceId={TraceId} CorrelationId={CorrelationId}",
                sozlesmePlaniId, sozlesmeOdemeId, traceId, corrId);

            return NotFound(ApiResponse<SozlesmeOdemeDto>.Fail(
                "NOT_FOUND",
                "Sözleşme ödeme kaydı bulunamadı.",
                "Bulunamadı",
                traceId));
        }

        _logger.LogInformation(
            "SozlesmeOdeme.Get succeeded. SozlesmePlaniId={SozlesmePlaniId} SozlesmeOdemeId={SozlesmeOdemeId} TraceId={TraceId} CorrelationId={CorrelationId}",
            sozlesmePlaniId, sozlesmeOdemeId, traceId, corrId);

        return Ok(ApiResponse<SozlesmeOdemeDto>.Ok(row, traceId: traceId));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<object>>> Create(long sozlesmePlaniId, [FromBody] CreateSozlesmeOdemeRequest req, CancellationToken ct)
    {
        var traceId = HttpContext.TraceIdentifier;
        var corrId = CorrelationIdMiddleware.Get(HttpContext);

        if (req.SozlesmePlaniId != (int)sozlesmePlaniId)
        {
            _logger.LogWarning(
                "SozlesmeOdeme.Create bad request. RouteSozlesmePlaniId={RouteId} BodySozlesmePlaniId={BodyId} TraceId={TraceId} CorrelationId={CorrelationId}",
                sozlesmePlaniId, req.SozlesmePlaniId, traceId, corrId);

            return BadRequest(ApiResponse<object>.Fail(
                "INVALID_REQUEST",
                "SozlesmePlaniId uyuşmuyor.",
                "SozlesmePlaniId uyuşmuyor",
                traceId));
        }

        try
        {
            var newId = await _repo.CreateAsync(req);

            _logger.LogInformation(
                "SozlesmeOdeme.Create succeeded. SozlesmePlaniId={SozlesmePlaniId} SozlesmeOdemeId={SozlesmeOdemeId} TraceId={TraceId} CorrelationId={CorrelationId}",
                sozlesmePlaniId, newId, traceId, corrId);

            return Ok(ApiResponse<object>.Ok(new { SozlesmeOdemeId = newId }, "Ödeme kaydı eklendi", traceId));
        }
        catch (FbException ex)
        {
            if (ex.Message.Contains("Column unknown", StringComparison.OrdinalIgnoreCase) ||
                ex.Message.Contains("validation error", StringComparison.OrdinalIgnoreCase))
            {
                _logger.LogWarning(ex,
                    "SozlesmeOdeme.Create DB schema issue. SozlesmePlaniId={SozlesmePlaniId} TraceId={TraceId} CorrelationId={CorrelationId}",
                    sozlesmePlaniId, traceId, corrId);

                return BadRequest(ApiResponse<object>.Fail(
                    "DB_SCHEMA_ERROR",
                    "Veritabanı şeması beklenenden farklı.",
                    ex.Message,
                    traceId));
            }

            _logger.LogWarning(ex,
                "SozlesmeOdeme.Create DB error. SozlesmePlaniId={SozlesmePlaniId} TraceId={TraceId} CorrelationId={CorrelationId}",
                sozlesmePlaniId, traceId, corrId);

            return BadRequest(ApiResponse<object>.Fail(
                "DB_ERROR",
                ex.Message,
                "İş kuralı ihlali",
                traceId));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "SozlesmeOdeme.Create exception. SozlesmePlaniId={SozlesmePlaniId} TraceId={TraceId} CorrelationId={CorrelationId}",
                sozlesmePlaniId, traceId, corrId);

            return StatusCode(500, ApiResponse<object>.Fail(
                "UNHANDLED",
                "Beklenmeyen bir hata oluştu.",
                ex.Message,
                traceId));
        }
    }

    [HttpPut("{sozlesmeOdemeId:int}")]
    public async Task<ActionResult<ApiResponse<object>>> Update(
        long sozlesmePlaniId,
        int sozlesmeOdemeId,
        [FromBody] UpdateSozlesmeOdemeRequest req,
        CancellationToken ct)
    {
        var traceId = HttpContext.TraceIdentifier;
        var corrId = CorrelationIdMiddleware.Get(HttpContext);

        if (req.SozlesmeOdemeId != sozlesmeOdemeId || req.SozlesmePlaniId != (int)sozlesmePlaniId)
        {
            _logger.LogWarning(
                "SozlesmeOdeme.Update bad request. Route keys mismatch. TraceId={TraceId} CorrelationId={CorrelationId}",
                traceId, corrId);

            return BadRequest(ApiResponse<object>.Fail(
                "INVALID_REQUEST",
                "Route ve body anahtarları uyuşmuyor.",
                "Anahtar uyuşmuyor",
                traceId));
        }

        try
        {
            // önce gerçekten bu plana ait mi kontrol (repo sade; burada kontrol ediyoruz)
            var existing = await _repo.GetAsync(sozlesmeOdemeId);
            if (existing is null || existing.SozlesmePlaniId != (int)sozlesmePlaniId)
            {
                _logger.LogWarning(
                    "SozlesmeOdeme.Update not found. SozlesmePlaniId={SozlesmePlaniId} SozlesmeOdemeId={SozlesmeOdemeId} TraceId={TraceId} CorrelationId={CorrelationId}",
                    sozlesmePlaniId, sozlesmeOdemeId, traceId, corrId);

                return NotFound(ApiResponse<object>.Fail(
                    "NOT_FOUND",
                    "Ödeme kaydı bulunamadı.",
                    "Bulunamadı",
                    traceId));
            }

            var ok = await _repo.UpdateAsync(sozlesmeOdemeId, req);
            if (!ok)
            {
                _logger.LogWarning(
                    "SozlesmeOdeme.Update not found/affected!=1. SozlesmePlaniId={SozlesmePlaniId} SozlesmeOdemeId={SozlesmeOdemeId} TraceId={TraceId} CorrelationId={CorrelationId}",
                    sozlesmePlaniId, sozlesmeOdemeId, traceId, corrId);

                return NotFound(ApiResponse<object>.Fail(
                    "NOT_FOUND",
                    "Ödeme kaydı bulunamadı.",
                    "Bulunamadı",
                    traceId));
            }
        }
        catch (FbException ex)
        {
            _logger.LogWarning(ex,
                "SozlesmeOdeme.Update trigger/DB error. SozlesmePlaniId={SozlesmePlaniId} SozlesmeOdemeId={SozlesmeOdemeId} TraceId={TraceId} CorrelationId={CorrelationId}",
                sozlesmePlaniId, sozlesmeOdemeId, traceId, corrId);

            return BadRequest(ApiResponse<object>.Fail(
                "BUSINESS_RULE",
                ex.Message,
                "İş kuralı ihlali",
                traceId));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "SozlesmeOdeme.Update exception. SozlesmePlaniId={SozlesmePlaniId} SozlesmeOdemeId={SozlesmeOdemeId} TraceId={TraceId} CorrelationId={CorrelationId}",
                sozlesmePlaniId, sozlesmeOdemeId, traceId, corrId);

            return StatusCode(500, ApiResponse<object>.Fail(
                "UNHANDLED",
                "Beklenmeyen bir hata oluştu.",
                ex.Message,
                traceId));
        }

        _logger.LogInformation(
            "SozlesmeOdeme.Update succeeded. SozlesmePlaniId={SozlesmePlaniId} SozlesmeOdemeId={SozlesmeOdemeId} TraceId={TraceId} CorrelationId={CorrelationId}",
            sozlesmePlaniId, sozlesmeOdemeId, traceId, corrId);

        return Ok(ApiResponse<object>.Ok(new { }, "Ödeme kaydı güncellendi", traceId));
    }

    [HttpDelete("{sozlesmeOdemeId:int}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(long sozlesmePlaniId, int sozlesmeOdemeId, CancellationToken ct)
    {
        var traceId = HttpContext.TraceIdentifier;
        var corrId = CorrelationIdMiddleware.Get(HttpContext);

        try
        {
            var existing = await _repo.GetAsync(sozlesmeOdemeId);
            if (existing is null || existing.SozlesmePlaniId != (int)sozlesmePlaniId)
            {
                _logger.LogWarning(
                    "SozlesmeOdeme.Delete not found. SozlesmePlaniId={SozlesmePlaniId} SozlesmeOdemeId={SozlesmeOdemeId} TraceId={TraceId} CorrelationId={CorrelationId}",
                    sozlesmePlaniId, sozlesmeOdemeId, traceId, corrId);

                return NotFound(ApiResponse<object>.Fail(
                    "NOT_FOUND",
                    "Ödeme kaydı bulunamadı.",
                    "Bulunamadı",
                    traceId));
            }

            var ok = await _repo.DeleteAsync(sozlesmeOdemeId);
            if (!ok)
            {
                _logger.LogWarning(
                    "SozlesmeOdeme.Delete not found/affected!=1. SozlesmePlaniId={SozlesmePlaniId} SozlesmeOdemeId={SozlesmeOdemeId} TraceId={TraceId} CorrelationId={CorrelationId}",
                    sozlesmePlaniId, sozlesmeOdemeId, traceId, corrId);

                return NotFound(ApiResponse<object>.Fail(
                    "NOT_FOUND",
                    "Ödeme kaydı bulunamadı.",
                    "Bulunamadı",
                    traceId));
            }
        }
        catch (FbException ex)
        {
            _logger.LogWarning(ex,
                "SozlesmeOdeme.Delete trigger/DB error. SozlesmePlaniId={SozlesmePlaniId} SozlesmeOdemeId={SozlesmeOdemeId} TraceId={TraceId} CorrelationId={CorrelationId}",
                sozlesmePlaniId, sozlesmeOdemeId, traceId, corrId);

            return BadRequest(ApiResponse<object>.Fail(
                "BUSINESS_RULE",
                ex.Message,
                "İş kuralı ihlali",
                traceId));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "SozlesmeOdeme.Delete exception. SozlesmePlaniId={SozlesmePlaniId} SozlesmeOdemeId={SozlesmeOdemeId} TraceId={TraceId} CorrelationId={CorrelationId}",
                sozlesmePlaniId, sozlesmeOdemeId, traceId, corrId);

            return StatusCode(500, ApiResponse<object>.Fail(
                "UNHANDLED",
                "Beklenmeyen bir hata oluştu.",
                ex.Message,
                traceId));
        }

        _logger.LogInformation(
            "SozlesmeOdeme.Delete succeeded. SozlesmePlaniId={SozlesmePlaniId} SozlesmeOdemeId={SozlesmeOdemeId} TraceId={TraceId} CorrelationId={CorrelationId}",
            sozlesmePlaniId, sozlesmeOdemeId, traceId, corrId);

        return Ok(ApiResponse<object>.Ok(new { }, "Ödeme kaydı silindi", traceId));
    }
}
