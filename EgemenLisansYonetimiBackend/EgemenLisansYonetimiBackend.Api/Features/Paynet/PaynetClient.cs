using System.Net.Http;
using System.Text;
using System.Text.Json;
using EgemenLisansYonetimiBackend.Api.Features.Paynet.Dtos.Subscription;

namespace EgemenLisansYonetimiBackend.Api.Features.Paynet;

public class PaynetClient
{
    private readonly HttpClient _http;
    private readonly ILogger<PaynetClient> _logger;

    private static readonly JsonSerializerOptions JsonOpt = new()
    {
        PropertyNamingPolicy = null,
        WriteIndented = false
    };

    public PaynetClient(HttpClient http, ILogger<PaynetClient> logger)
    {
        _http = http;
        _logger = logger;
    }

    // 🔥 Tek Generic Core
    public async Task<TRes> PostAsync<TReq, TRes>(
        string path,
        TReq body,
        string? correlationId,
        CancellationToken ct)
        where TRes : class
    {
        var json = JsonSerializer.Serialize(body, JsonOpt);

        using var req = new HttpRequestMessage(HttpMethod.Post, path)
        {
            Content = new StringContent(json, Encoding.UTF8, "application/json")
        };

        if (!string.IsNullOrWhiteSpace(correlationId))
            req.Headers.TryAddWithoutValidation("X-Correlation-Id", correlationId);

        using var resp = await _http.SendAsync(req, ct);
        var respBody = await resp.Content.ReadAsStringAsync(ct);

        if (!resp.IsSuccessStatusCode)
        {
            _logger.LogError("Paynet HTTP error. {Method} {Path} Status={Status} Body={Body} CorrId={CorrId}",
                "POST", path, (int)resp.StatusCode, respBody, correlationId);

            throw new InvalidOperationException($"Paynet HTTP {(int)resp.StatusCode}: {respBody}");
        }

        var parsed = JsonSerializer.Deserialize<TRes>(respBody, JsonOpt);
        if (parsed is null)
            throw new InvalidOperationException($"Paynet response parse edilemedi. Path={path}. Body={respBody}");

        return parsed;
    }

    // ✅ Typed wrapper (abonelik oluşturma)
    public Task<CreateSubscriptionResponse> CreateSubscriptionAsync(
        CreateSubscriptionRequest req,
        string? correlationId,
        CancellationToken ct)
        => PostAsync<CreateSubscriptionRequest, CreateSubscriptionResponse>(
            PaynetEndpoints.SubscriptionCreate, req, correlationId, ct);
}
