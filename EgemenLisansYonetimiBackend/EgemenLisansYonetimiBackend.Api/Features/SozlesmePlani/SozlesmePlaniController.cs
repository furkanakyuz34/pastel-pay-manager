using EgemenLisansYonetimiBackend.Api.Common;
using EgemenLisansYonetimiBackend.Api.Infrastructure.Logging;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace EgemenLisansYonetimiBackend.Api.Features.SozlesmePlani;

[ApiController]
[Route("api/sozlesmeplani")]
[Authorize]
public sealed class SozlesmePlaniController : ControllerBase
{
    private readonly SozlesmePlaniRepository _repo;
    private readonly ILogger<SozlesmePlaniController> _logger;

    public SozlesmePlaniController(SozlesmePlaniRepository repo, ILogger<SozlesmePlaniController> logger)
    {
        _repo = repo;
        _logger = logger;
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<long>>> Create([FromBody] InsertSozlesmePlaniCommand req, CancellationToken ct)
    {
        var traceId = HttpContext.TraceIdentifier;
        var corrId = CorrelationIdMiddleware.Get(HttpContext);

        var id = await _repo.InsertAsync(req, ct);

        _logger.LogInformation("SozlesmePlani.Create succeeded. SozlesmePlanId={SozlesmePlanId} SozlesmeId={SozlesmeId} TraceId={TraceId} CorrelationId={CorrelationId}",
            id, req.SozlesmeId, traceId, corrId);

        return Ok(ApiResponse<long>.Ok(id, "Sözleşme planı oluşturuldu", traceId));
    }

    [HttpPut("{sozlesmePlanId:long}")]
    public async Task<ActionResult<ApiResponse<object>>> Update(long sozlesmePlanId, [FromBody] UpdateSozlesmePlaniCommand req, CancellationToken ct)
    {
        var traceId = HttpContext.TraceIdentifier;
        var corrId = CorrelationIdMiddleware.Get(HttpContext);

        if (req.SozlesmePlanId != sozlesmePlanId)
        {
            _logger.LogWarning("SozlesmePlani.Update bad request. RouteId={RouteId} BodyId={BodyId} TraceId={TraceId} CorrelationId={CorrelationId}",
                sozlesmePlanId, req.SozlesmePlanId, traceId, corrId);

            return BadRequest(ApiResponse<object>.Fail("INVALID_REQUEST", "ID uyuşmuyor.", "ID uyuşmuyor", traceId));
        }

        var ok = await _repo.UpdateAsync(req, ct);
        if (!ok)
        {
            _logger.LogWarning("SozlesmePlani.Update not found. SozlesmePlanId={SozlesmePlanId} TraceId={TraceId} CorrelationId={CorrelationId}",
                sozlesmePlanId, traceId, corrId);

            return NotFound(ApiResponse<object>.Fail("NOT_FOUND", "Sözleşme planı bulunamadı.", "Bulunamadı", traceId));
        }

        _logger.LogInformation("SozlesmePlani.Update succeeded. SozlesmePlanId={SozlesmePlanId} TraceId={TraceId} CorrelationId={CorrelationId}",
            sozlesmePlanId, traceId, corrId);

        return Ok(ApiResponse<object>.Ok(new { }, "Sözleşme planı güncellendi", traceId));
    }

    [HttpGet("sozlesme/{sozlesmeId:long}")]
    public async Task<ActionResult<ApiResponse<SozlesmePlaniRow>>> GetBySozlesme(long sozlesmeId, CancellationToken ct)
    {
        var traceId = HttpContext.TraceIdentifier;
        var result = await _repo.GetBySozlesmeIdAsync(sozlesmeId, ct);

        if (result is null)
            return NotFound(ApiResponse<SozlesmePlaniRow>.Fail("NOT_FOUND", "Plan bulunamadı.", "Plan bulunamadı", traceId));

        return Ok(ApiResponse<SozlesmePlaniRow>.Ok(result, traceId: traceId));
    }

    // GET /api/sozlesmeplani/hesapla?sozlesmeId=...&planId=...&genelIskonto=...&abonelikIskonto=...&dovizId=...
    [HttpGet("hesapla")]
    public async Task<ActionResult<ApiResponse<SozlesmePlaniUcretRow>>> Hesapla(
        [FromQuery] long sozlesmeId,
        [FromQuery] int planId,
        [FromQuery] decimal? genelIskonto,
        [FromQuery] decimal? abonelikIskonto,
        [FromQuery(Name = "dovizId")] string? hedefDovizId,
        CancellationToken ct)
    {
        var traceId = HttpContext.TraceIdentifier;
        var corrId = CorrelationIdMiddleware.Get(HttpContext);

        var result = await _repo.CalculateUcretAsync(sozlesmeId, planId, genelIskonto, abonelikIskonto, hedefDovizId, ct);

        if (result is null)
        {
            _logger.LogWarning("SozlesmePlani.Hesapla no result. SozlesmeId={SozlesmeId} PlanId={PlanId} TraceId={TraceId} CorrelationId={CorrelationId}",
                sozlesmeId, planId, traceId, corrId);

            return NotFound(ApiResponse<SozlesmePlaniUcretRow>.Fail("NOT_FOUND", "Hesaplama sonucu bulunamadı.", "Hesaplama sonucu bulunamadı", traceId));
        }

        _logger.LogInformation("SozlesmePlani.Hesapla succeeded. SozlesmeId={SozlesmeId} PlanId={PlanId} TraceId={TraceId} CorrelationId={CorrelationId}",
            sozlesmeId, planId, traceId, corrId);

        return Ok(ApiResponse<SozlesmePlaniUcretRow>.Ok(result, traceId: traceId));
    }
}