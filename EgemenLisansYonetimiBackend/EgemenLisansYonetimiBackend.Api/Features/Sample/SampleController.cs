using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EgemenLisansYonetimiBackend.Api.Features.Sample;

[ApiController]
[Route("sample")]
public sealed class SampleController : ControllerBase
{
    private readonly SampleService _sampleService;

    public SampleController(SampleService sampleService)
    {
        _sampleService = sampleService;
    }

    [Authorize]
    [HttpGet("hello")]
    public ActionResult<HelloWorldResponse> Hello()
    {
        var result = _sampleService.HelloWorld();
        return Ok(result);
    }
}
