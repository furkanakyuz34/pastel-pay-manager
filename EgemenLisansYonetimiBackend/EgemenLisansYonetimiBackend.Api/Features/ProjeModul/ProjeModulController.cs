using EgemenLisansYonetimiBackend.Api.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EgemenLisansYonetimiBackend.Api.Features.ProjeModul;

[ApiController]
[Route("api/projemodul")]
[Authorize]
public sealed class ProjeModulController : ControllerBase
{
    private readonly ProjeModulRepository _repo;
    public ProjeModulController(ProjeModulRepository repo) => _repo = repo;

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<ProjeModulDto>>>> List([FromQuery] int? projeId)
    {
        var data = await _repo.ListAsync(projeId);
        return Ok(ApiResponse<IReadOnlyList<ProjeModulDto>>.Ok(data, traceId: HttpContext.TraceIdentifier));
    }

    [HttpGet("{projeModulId:int}")]
    public async Task<ActionResult<ApiResponse<ProjeModulDto>>> Get(int projeModulId)
    {
        var item = await _repo.GetAsync(projeModulId);
        if (item is null)
            return NotFound(ApiResponse<ProjeModulDto>.Fail("NOT_FOUND", "Proje modülü bulunamadı.", "Bulunamadı", HttpContext.TraceIdentifier));

        return Ok(ApiResponse<ProjeModulDto>.Ok(item, traceId: HttpContext.TraceIdentifier));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<int>>> Create([FromBody] ProjeModulCreateRequest req)
    {
        var id = await _repo.CreateAsync(req);
        return Ok(ApiResponse<int>.Ok(id, "Proje modülü oluşturuldu", HttpContext.TraceIdentifier));
    }

    [HttpPut("{projeModulId:int}")]
    public async Task<ActionResult<ApiResponse<object>>> Update(int projeModulId, [FromBody] ProjeModulUpdateRequest req)
    {
        var ok = await _repo.UpdateAsync(projeModulId, req);
        if (!ok)
            return NotFound(ApiResponse<object>.Fail("NOT_FOUND", "Proje modülü bulunamadı.", "Bulunamadı", HttpContext.TraceIdentifier));

        return Ok(ApiResponse<object>.Ok(new { }, "Proje modülü güncellendi", HttpContext.TraceIdentifier));
    }

    [HttpDelete("{projeModulId:int}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(int projeModulId)
    {
        var ok = await _repo.DeleteAsync(projeModulId);
        if (!ok)
            return NotFound(ApiResponse<object>.Fail("NOT_FOUND", "Proje modülü bulunamadı.", "Bulunamadı", HttpContext.TraceIdentifier));

        return Ok(ApiResponse<object>.Ok(new { }, "Proje modülü silindi", HttpContext.TraceIdentifier));
    }
}
