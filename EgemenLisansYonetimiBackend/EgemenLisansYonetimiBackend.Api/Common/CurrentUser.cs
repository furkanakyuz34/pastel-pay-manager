using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace EgemenLisansYonetimiBackend.Api.Common;

public static class CurrentUser
{
    public static int GetUserId(ClaimsPrincipal user)
    {
        var idStr =
            user.FindFirstValue(JwtRegisteredClaimNames.Sub) ??
            user.FindFirstValue(ClaimTypes.NameIdentifier);

        return int.TryParse(idStr, out var id) ? id : 0;
    }
}