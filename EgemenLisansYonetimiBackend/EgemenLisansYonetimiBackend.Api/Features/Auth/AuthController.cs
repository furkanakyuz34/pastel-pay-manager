using EgemenLisansYonetimiBackend.Api.Common;
using EgemenLisansYonetimiBackend.Api.Infrastructure.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace EgemenLisansYonetimiBackend.Api.Features.Auth;

[ApiController]
[Route("auth")]
public sealed class AuthController : ControllerBase
{
    private readonly UserRepository _users;
    private readonly JwtTokenService _jwt;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        UserRepository users,
        JwtTokenService jwt,
        ILogger<AuthController> logger)
    {
        _users = users;
        _jwt = jwt;
        _logger = logger;
    }


    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> Login(
        [FromBody] LoginRequest req)
    {
        var user = await _users.GetByIdAndPasswordAsync(req.KullaniciId, req.Sifre);

        if (user is null)
        {
            _logger.LogWarning(
                "Login failed. KullaniciId={KullaniciId}",
                req.KullaniciId
            );

            return Unauthorized(ApiResponse<LoginResponse>.Fail(
                code: "AUTH_INVALID",
                detail: "Kullanıcı bulunamadı veya şifre hatalı.",
                message: "Giriş başarısız",
                traceId: HttpContext.TraceIdentifier
            ));
        }

        var token = _jwt.CreateToken(
            user.KullaniciId.ToString(),
            user.Adi
        );

        _logger.LogInformation(
            "Login success. KullaniciId={KullaniciId}",
            user.KullaniciId
        );

        return Ok(ApiResponse<LoginResponse>.Ok(
            new LoginResponse(token),
            message: "Giriş başarılı",
            traceId: HttpContext.TraceIdentifier
        ));
    }


    [Authorize]
    [HttpGet("me")]
    public ActionResult<ApiResponse<MeResponse>> Me()
    {
        var idStr =
            User.FindFirstValue(JwtRegisteredClaimNames.Sub) ??
            User.FindFirstValue(ClaimTypes.NameIdentifier);

        var adi =
            User.FindFirstValue("name") ??
            User.FindFirstValue(ClaimTypes.Name) ??
            "";

        if (!int.TryParse(idStr, out var kullaniciId))
        {
            return Unauthorized(ApiResponse<MeResponse>.Fail(
                code: "AUTH_BAD_TOKEN",
                detail: $"KullaniciId okunamadı. sub/nameid: '{idStr ?? "NULL"}'",
                message: "Yetkisiz",
                traceId: HttpContext.TraceIdentifier
            ));
        }

        return Ok(ApiResponse<MeResponse>.Ok(
            new MeResponse(kullaniciId, adi),
            traceId: HttpContext.TraceIdentifier
        ));
    }
}
