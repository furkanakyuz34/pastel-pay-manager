using System.Text.Json.Serialization;

namespace EgemenLisansYonetimiBackend.Api.Features.Paynet.Dtos.Subscription;

public class CreateSubscriptionResponse
{
    [JsonPropertyName("object_name")]
    public string? ObjectName { get; set; }

    [JsonPropertyName("code")]
    public int Code { get; set; }

    [JsonPropertyName("message")]
    public string? Message { get; set; }

    [JsonPropertyName("url")]
    public string? Url { get; set; }

    [JsonPropertyName("subscription_id")]
    public string? SubscriptionId { get; set; }

    [JsonPropertyName("status")]
    public string? Status { get; set; }
}
