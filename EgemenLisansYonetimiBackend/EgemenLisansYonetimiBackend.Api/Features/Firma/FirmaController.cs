using EgemenLisansYonetimiBackend.Api.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EgemenLisansYonetimiBackend.Api.Features.Firma;

[ApiController]
[Route("api/firma")]
[Authorize]
public sealed class FirmaController : ControllerBase
{
    private readonly FirmaRepository _repo;
    private readonly ILogger<FirmaController> _logger;

    public FirmaController(FirmaRepository repo, ILogger<FirmaController> logger)
    {
        _repo = repo;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<FirmaDto>>>> List()
    {
        var data = await _repo.ListAsync();
        return Ok(ApiResponse<IReadOnlyList<FirmaDto>>.Ok(data, traceId: HttpContext.TraceIdentifier));
    }

    [HttpGet("{firmaId:int}")]
    public async Task<ActionResult<ApiResponse<FirmaDto>>> Get(int firmaId)
    {
        var item = await _repo.GetAsync(firmaId);
        if (item is null)
            return NotFound(ApiResponse<FirmaDto>.Fail("NOT_FOUND", "Firma bulunamadı.", "Bulunamadı", HttpContext.TraceIdentifier));

        return Ok(ApiResponse<FirmaDto>.Ok(item, traceId: HttpContext.TraceIdentifier));
    }

    [HttpPost]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<int>>> Create([FromBody] FirmaCreateRequest req)
    {
        var userId = CurrentUser.GetUserId(User);
        if (userId <= 0)
            return Unauthorized(ApiResponse<int>.Fail("AUTH_BAD_TOKEN", "Kullanıcı id okunamadı.", "Yetkisiz", HttpContext.TraceIdentifier));

        var id = await _repo.CreateAsync(req, userId);
        _logger.LogInformation("Firma created. FirmaId={FirmaId} CreatedBy={UserId}", id, userId);

        return Ok(ApiResponse<int>.Ok(id, "Firma oluşturuldu", HttpContext.TraceIdentifier));
    }

    [HttpPut("{firmaId:int}")]
    public async Task<ActionResult<ApiResponse<object>>> Update(int firmaId, [FromBody] FirmaUpdateRequest req)
    {
        var userId = CurrentUser.GetUserId(User);
        if (userId <= 0)
            return Unauthorized(ApiResponse<object>.Fail("AUTH_BAD_TOKEN", "Kullanıcı id okunamadı.", "Yetkisiz", HttpContext.TraceIdentifier));

        var ok = await _repo.UpdateAsync(firmaId, req, userId);
        if (!ok)
            return NotFound(ApiResponse<object>.Fail("NOT_FOUND", "Firma bulunamadı.", "Bulunamadı", HttpContext.TraceIdentifier));

        _logger.LogInformation("Firma updated. FirmaId={FirmaId} UpdatedBy={UserId}", firmaId, userId);
        return Ok(ApiResponse<object>.Ok(new { }, "Firma güncellendi", HttpContext.TraceIdentifier));
    }

    [HttpDelete("{firmaId:int}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(int firmaId)
    {
        var ok = await _repo.DeleteAsync(firmaId);
        if (!ok)
            return NotFound(ApiResponse<object>.Fail("NOT_FOUND", "Firma bulunamadı.", "Bulunamadı", HttpContext.TraceIdentifier));

        return Ok(ApiResponse<object>.Ok(new { }, "Firma silindi", HttpContext.TraceIdentifier));
    }
}
