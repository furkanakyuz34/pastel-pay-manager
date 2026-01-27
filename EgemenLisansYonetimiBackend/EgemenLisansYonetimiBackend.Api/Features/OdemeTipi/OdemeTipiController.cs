using EgemenLisansYonetimiBackend.Api.Common;
using EgemenLisansYonetimiBackend.Api.Infrastructure.Logging;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace EgemenLisansYonetimiBackend.Api.Features.OdemeTipi;

[ApiController]
[Route("api/odeme-tipi")]
[Authorize]
public sealed class OdemeTipiController : ControllerBase
{
    private readonly OdemeTipiRepository _repo;
    private readonly ILogger<OdemeTipiController> _logger;

    public OdemeTipiController(OdemeTipiRepository repo, ILogger<OdemeTipiController> logger)
    {
        _repo = repo;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<OdemeTipiDto>>>> List()
    {
        var traceId = HttpContext.TraceIdentifier;
        var corrId = CorrelationIdMiddleware.Get(HttpContext);

        var rows = await _repo.ListAsync();

        _logger.LogInformation(
            "OdemeTipi.List called. Count={Count} TraceId={TraceId} CorrelationId={CorrelationId}",
            rows.Count(), traceId, corrId);

        return Ok(ApiResponse<IEnumerable<OdemeTipiDto>>.Ok(rows, traceId: traceId));
    }
}
