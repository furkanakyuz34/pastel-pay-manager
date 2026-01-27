using EgemenLisansYonetimiBackend.Api.Common;
using EgemenLisansYonetimiBackend.Api.Infrastructure.Logging;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace EgemenLisansYonetimiBackend.Api.Features.OdemeYontemi;

[ApiController]
[Route("api/odeme-yontemi")]
[Authorize]
public sealed class OdemeYontemiController : ControllerBase
{
    private readonly OdemeYontemiRepository _repo;
    private readonly ILogger<OdemeYontemiController> _logger;

    public OdemeYontemiController(OdemeYontemiRepository repo, ILogger<OdemeYontemiController> logger)
    {
        _repo = repo;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<OdemeYontemiDto>>>> List()
    {
        var traceId = HttpContext.TraceIdentifier;
        var corrId = CorrelationIdMiddleware.Get(HttpContext);

        var rows = await _repo.ListAsync();

        _logger.LogInformation(
            "OdemeYontemi.List called. Count={Count} TraceId={TraceId} CorrelationId={CorrelationId}",
            rows.Count(), traceId, corrId);

        return Ok(ApiResponse<IEnumerable<OdemeYontemiDto>>.Ok(rows, traceId: traceId));
    }
}
