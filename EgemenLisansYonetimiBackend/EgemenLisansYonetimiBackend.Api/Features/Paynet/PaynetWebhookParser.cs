using System.Text.Json;

namespace EgemenLisansYonetimiBackend.Api.Features.Paynet;

public static class PaynetWebhookParser
{
    public static string? TryGetString(JsonElement root, params string[] names)
    {
        foreach (var n in names)
        {
            if (root.ValueKind == JsonValueKind.Object && root.TryGetProperty(n, out var p))
            {
                if (p.ValueKind == JsonValueKind.String) return p.GetString();
                if (p.ValueKind is JsonValueKind.Number or JsonValueKind.True or JsonValueKind.False)
                    return p.ToString();
            }
        }

        // bazen "data":{...} içinde gelir
        if (root.ValueKind == JsonValueKind.Object && root.TryGetProperty("data", out var data) && data.ValueKind == JsonValueKind.Object)
        {
            foreach (var n in names)
            {
                if (data.TryGetProperty(n, out var p))
                {
                    if (p.ValueKind == JsonValueKind.String) return p.GetString();
                    if (p.ValueKind is JsonValueKind.Number or JsonValueKind.True or JsonValueKind.False)
                        return p.ToString();
                }
            }
        }

        return null;
    }
}
