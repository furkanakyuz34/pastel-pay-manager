using EgemenLisansYonetimiBackend.Api.Common;
using EgemenLisansYonetimiBackend.Api.Infrastructure.Logging;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace EgemenLisansYonetimiBackend.Api.Features.Sozlesme;

[ApiController]
[Route("api/sozlesme")]
[Authorize]
public sealed class SozlesmeController : ControllerBase
{
    private readonly SozlesmeRepository _repo;
    private readonly ILogger<SozlesmeController> _logger;

    public SozlesmeController(SozlesmeRepository repo, ILogger<SozlesmeController> logger)
    {
        _repo = repo;
        _logger = logger;
    }

    [HttpGet("{sozlesmeId:long}")]
    public async Task<ActionResult<ApiResponse<SozlesmeRow>>> Get(long sozlesmeId, CancellationToken ct)
    {
        var traceId = HttpContext.TraceIdentifier;
        var corrId = CorrelationIdMiddleware.Get(HttpContext);

        var row = await _repo.GetSozlesmeAsync(sozlesmeId, ct);
        if (row is null)
        {
            _logger.LogWarning("Sozlesme.Get not found. SozlesmeId={SozlesmeId} TraceId={TraceId} CorrelationId={CorrelationId}",
                sozlesmeId, traceId, corrId);

            return NotFound(ApiResponse<SozlesmeRow>.Fail("NOT_FOUND", "Sözleşme bulunamadı.", "Bulunamadı", traceId));
        }

        _logger.LogInformation("Sozlesme.Get succeeded. SozlesmeId={SozlesmeId} TraceId={TraceId} CorrelationId={CorrelationId}",
            sozlesmeId, traceId, corrId);

        return Ok(ApiResponse<SozlesmeRow>.Ok(row, traceId: traceId));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<long>>> Create([FromBody] InsertSozlesmeCommand req, CancellationToken ct)
    {
        var traceId = HttpContext.TraceIdentifier;
        var corrId = CorrelationIdMiddleware.Get(HttpContext);

        var id = await _repo.InsertSozlesmeAsync(req, ct);

        _logger.LogInformation("Sozlesme.Create succeeded. SozlesmeId={SozlesmeId} FirmaId={FirmaId} TraceId={TraceId} CorrelationId={CorrelationId}",
            id, req.FirmaId, traceId, corrId);

        return Ok(ApiResponse<long>.Ok(id, "Sözleşme oluşturuldu", traceId));
    }

    [HttpPut("{sozlesmeId:long}")]
    public async Task<ActionResult<ApiResponse<object>>> Update(long sozlesmeId, [FromBody] UpdateSozlesmeCommand req, CancellationToken ct)
    {
        var traceId = HttpContext.TraceIdentifier;
        var corrId = CorrelationIdMiddleware.Get(HttpContext);

        // ensure id matches route
        if (req.SozlesmeId != sozlesmeId)
        {
            _logger.LogWarning("Sozlesme.Update bad request. RouteId={RouteId} BodyId={BodyId} TraceId={TraceId} CorrelationId={CorrelationId}",
                sozlesmeId, req.SozlesmeId, traceId, corrId);

            return BadRequest(ApiResponse<object>.Fail("INVALID_REQUEST", "ID uyuşmuyor.", "ID uyuşmuyor", traceId));
        }

        var ok = await _repo.UpdateSozlesmeAsync(req, ct);
        if (!ok)
        {
            _logger.LogWarning("Sozlesme.Update not found. SozlesmeId={SozlesmeId} TraceId={TraceId} CorrelationId={CorrelationId}",
                sozlesmeId, traceId, corrId);

            return NotFound(ApiResponse<object>.Fail("NOT_FOUND", "Sözleşme bulunamadı.", "Bulunamadı", traceId));
        }

        _logger.LogInformation("Sozlesme.Update succeeded. SozlesmeId={SozlesmeId} TraceId={TraceId} CorrelationId={CorrelationId}",
            sozlesmeId, traceId, corrId);

        return Ok(ApiResponse<object>.Ok(new { }, "Sözleşme güncellendi", traceId));
    }

    [HttpDelete("{sozlesmeId:long}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(long sozlesmeId, CancellationToken ct)
    {
        var traceId = HttpContext.TraceIdentifier;
        var corrId = CorrelationIdMiddleware.Get(HttpContext);

        await _repo.DeleteSozlesmeAsync(sozlesmeId, ct);

        _logger.LogInformation("Sozlesme.Delete executed. SozlesmeId={SozlesmeId} TraceId={TraceId} CorrelationId={CorrelationId}",
            sozlesmeId, traceId, corrId);

        return Ok(ApiResponse<object>.Ok(new { }, "Sözleşme silindi", traceId));
    }
}