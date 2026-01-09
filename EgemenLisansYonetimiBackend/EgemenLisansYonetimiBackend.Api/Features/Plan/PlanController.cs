using Dapper;
using EgemenLisansYonetimiBackend.Api.Common;
using EgemenLisansYonetimiBackend.Api.Infrastructure.Db;
using EgemenLisansYonetimiBackend.Api.Infrastructure.Logging;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace EgemenLisansYonetimiBackend.Api.Features.Plan;

public sealed record PlanRow(int PlanId, string Adi, int PesinatOrani, int AbonelikHesaplamaKatsayisi);

// Request DTOs for Create / Update
public sealed record CreatePlanRequest(string Adi, int PesinatOrani, int AbonelikHesaplamaKatsayisi);
public sealed record UpdatePlanRequest(int PlanId, string Adi, int PesinatOrani, int AbonelikHesaplamaKatsayisi);

[ApiController]
[Route("api/futures/plan")]
[Authorize]
public sealed class PlanController : ControllerBase
{
    private readonly IDbConnectionFactory _db;
    private readonly ILogger<PlanController> _logger;

    public PlanController(IDbConnectionFactory db, ILogger<PlanController> logger)
    {
        _db = db;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<PlanRow>>>> List(CancellationToken ct)
    {
        var traceId = HttpContext.TraceIdentifier;
        var corrId = CorrelationIdMiddleware.Get(HttpContext);

        const string sql = @"
SELECT
  PLANID AS PlanId,
  ADI     AS Adi,
  PesinatOrani AS PesinatOrani,
  AbonelikHesaplamaKatsayisi AS AbonelikHesaplamaKatsayisi
FROM ""PLAN""
ORDER BY ADI;
";

        try
        {
            await using var conn = _db.Create();
            var def = new CommandDefinition(sql, cancellationToken: ct);
            var rows = await conn.QueryAsync<PlanRow>(def);

            _logger.LogInformation("Plan.List succeeded. Count={Count} TraceId={TraceId} CorrelationId={CorrelationId}",
                rows.AsList().Count, traceId, corrId);

            return Ok(ApiResponse<IEnumerable<PlanRow>>.Ok(rows, traceId: traceId));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Plan.List exception. TraceId={TraceId} CorrelationId={CorrelationId}", traceId, corrId);
            return StatusCode(500, ApiResponse<IEnumerable<PlanRow>>.Fail("UNHANDLED", "Beklenmeyen bir hata oluştu.", ex.Message, traceId));
        }
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<int>>> Create([FromBody] CreatePlanRequest req, CancellationToken ct)
    {
        var traceId = HttpContext.TraceIdentifier;
        var corrId = CorrelationIdMiddleware.Get(HttpContext);

        const string sql = @"
INSERT INTO ""PLAN"" (ADI, PesinatOrani, AbonelikHesaplamaKatsayisi)
VALUES (@Adi, @PesinatOrani, @AbonelikHesaplamaKatsayisi)
RETURNING PLANID;
";

        try
        {
            await using var conn = _db.Create();
            var def = new CommandDefinition(sql, new
            {
                req.Adi,
                req.PesinatOrani,
                req.AbonelikHesaplamaKatsayisi
            }, cancellationToken: ct);

            var id = await conn.ExecuteScalarAsync<int>(def);

            _logger.LogInformation("Plan.Create succeeded. PlanId={PlanId} Adi={Adi} TraceId={TraceId} CorrelationId={CorrelationId}",
                id, req.Adi, traceId, corrId);

            return Ok(ApiResponse<int>.Ok(id, "Plan oluşturuldu", traceId));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Plan.Create exception. Adi={Adi} TraceId={TraceId} CorrelationId={CorrelationId}", req.Adi, traceId, corrId);
            return StatusCode(500, ApiResponse<int>.Fail("UNHANDLED", "Beklenmeyen bir hata oluştu.", ex.Message, traceId));
        }
    }

    [HttpPut("{planId:int}")]
    public async Task<ActionResult<ApiResponse<object>>> Update(int planId, [FromBody] UpdatePlanRequest req, CancellationToken ct)
    {
        var traceId = HttpContext.TraceIdentifier;
        var corrId = CorrelationIdMiddleware.Get(HttpContext);

        if (req.PlanId != planId)
            return BadRequest(ApiResponse<object>.Fail("INVALID_REQUEST", "Route PlanId and body PlanId must match.", "ID uyuşmuyor", traceId));

        const string sql = @"
UPDATE ""PLAN""
SET ADI = @Adi,
    PesinatOrani = @PesinatOrani,
    AbonelikHesaplamaKatsayisi = @AbonelikHesaplamaKatsayisi
WHERE PLANID = @PlanId;
";

        try
        {
            await using var conn = _db.Create();
            var def = new CommandDefinition(sql, new
            {
                req.PlanId,
                req.Adi,
                req.PesinatOrani,
                req.AbonelikHesaplamaKatsayisi
            }, cancellationToken: ct);

            var affected = await conn.ExecuteAsync(def);
            if (affected == 0)
            {
                _logger.LogWarning("Plan.Update not found. PlanId={PlanId} TraceId={TraceId} CorrelationId={CorrelationId}", planId, traceId, corrId);
                return NotFound(ApiResponse<object>.Fail("NOT_FOUND", "Plan bulunamadı.", "Bulunamadı", traceId));
            }

            _logger.LogInformation("Plan.Update succeeded. PlanId={PlanId} TraceId={TraceId} CorrelationId={CorrelationId}", planId, traceId, corrId);
            return Ok(ApiResponse<object>.Ok(new { }, "Plan güncellendi", traceId));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Plan.Update exception. PlanId={PlanId} TraceId={TraceId} CorrelationId={CorrelationId}", planId, traceId, corrId);
            return StatusCode(500, ApiResponse<object>.Fail("UNHANDLED", "Beklenmeyen bir hata oluştu.", ex.Message, traceId));
        }
    }

    [HttpDelete("{planId:int}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(int planId, CancellationToken ct)
    {
        var traceId = HttpContext.TraceIdentifier;
        var corrId = CorrelationIdMiddleware.Get(HttpContext);

        const string sql = @"DELETE FROM ""PLAN"" WHERE PLANID = @PlanId;";

        try
        {
            await using var conn = _db.Create();
            var def = new CommandDefinition(sql, new { PlanId = planId }, cancellationToken: ct);
            var affected = await conn.ExecuteAsync(def);
            if (affected == 0)
            {
                _logger.LogWarning("Plan.Delete not found. PlanId={PlanId} TraceId={TraceId} CorrelationId={CorrelationId}", planId, traceId, corrId);
                return NotFound(ApiResponse<object>.Fail("NOT_FOUND", "Plan bulunamadı.", "Bulunamadı", traceId));
            }

            _logger.LogInformation("Plan.Delete succeeded. PlanId={PlanId} TraceId={TraceId} CorrelationId={CorrelationId}", planId, traceId, corrId);
            return Ok(ApiResponse<object>.Ok(new { }, "Plan silindi", traceId));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Plan.Delete exception. PlanId={PlanId} TraceId={TraceId} CorrelationId={CorrelationId}", planId, traceId, corrId);
            return StatusCode(500, ApiResponse<object>.Fail("UNHANDLED", "Beklenmeyen bir hata oluştu.", ex.Message, traceId));
        }
    }
}