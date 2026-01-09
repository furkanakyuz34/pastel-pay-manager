using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EgemenLisansYonetimiBackend.Api.Features.Paynet;

[ApiController]
[Route("api/paynet")]
[Authorize]
public sealed class PaynetController : ControllerBase
{
   // private readonly PaynetRepository _repo;
    private readonly PaynetClient _paynet;
    private readonly ILogger<PaynetController> _logger;

    public PaynetController(
        //PaynetRepository repo,
        PaynetClient paynet,
        ILogger<PaynetController> logger)
    {
        //_repo = repo;
        _paynet = paynet;
        _logger = logger;
    }

}
