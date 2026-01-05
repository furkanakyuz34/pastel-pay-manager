using EgemenLisansYonetimiBackend.Api.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EgemenLisansYonetimiBackend.Api.Features.Proje;

[ApiController]
[Route("api/proje")]
[Authorize]
public sealed class ProjeController : ControllerBase
{
    private readonly ProjeRepository _repo;

    public ProjeController(ProjeRepository repo) => _repo = repo;

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<ProjeDto>>>> List()
    {
        var data = await _repo.ListAsync();
        return Ok(ApiResponse<IReadOnlyList<ProjeDto>>.Ok(data, traceId: HttpContext.TraceIdentifier));
    }

    [HttpGet("{projeId:int}")]
    public async Task<ActionResult<ApiResponse<ProjeDto>>> Get(int projeId)
    {
        var item = await _repo.GetAsync(projeId);
        if (item is null)
            return NotFound(ApiResponse<ProjeDto>.Fail("NOT_FOUND", "Proje bulunamadı.", "Bulunamadı", HttpContext.TraceIdentifier));

        return Ok(ApiResponse<ProjeDto>.Ok(item, traceId: HttpContext.TraceIdentifier));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<int>>> Create([FromBody] ProjeCreateRequest req)
    {
        var id = await _repo.CreateAsync(req);
        return Ok(ApiResponse<int>.Ok(id, "Proje oluşturuldu", HttpContext.TraceIdentifier));
    }

    [HttpPut("{projeId:int}")]
    public async Task<ActionResult<ApiResponse<object>>> Update(int projeId, [FromBody] ProjeUpdateRequest req)
    {
        var ok = await _repo.UpdateAsync(projeId, req);
        if (!ok)
            return NotFound(ApiResponse<object>.Fail("NOT_FOUND", "Proje bulunamadı.", "Bulunamadı", HttpContext.TraceIdentifier));

        return Ok(ApiResponse<object>.Ok(new { }, "Proje güncellendi", HttpContext.TraceIdentifier));
    }

    [HttpDelete("{projeId:int}")]
    public async Task<ActionResult<ApiResponse<object>>> Delete(int projeId)
    {
        var ok = await _repo.DeleteAsync(projeId);
        if (!ok)
            return NotFound(ApiResponse<object>.Fail("NOT_FOUND", "Proje bulunamadı.", "Bulunamadı", HttpContext.TraceIdentifier));

        return Ok(ApiResponse<object>.Ok(new { }, "Proje silindi", HttpContext.TraceIdentifier));
    }
}
