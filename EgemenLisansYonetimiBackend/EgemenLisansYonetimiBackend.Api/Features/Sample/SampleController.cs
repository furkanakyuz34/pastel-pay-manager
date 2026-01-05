using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EgemenLisansYonetimiBackend.Api.Features.Sample;

[ApiController]
[Route("sample")]
public sealed class SampleController : ControllerBase
{
    [Authorize]
    [HttpGet("secure-ping")]
    public IActionResult SecurePing() => Ok(new { ok = true, at = DateTime.UtcNow });
}
