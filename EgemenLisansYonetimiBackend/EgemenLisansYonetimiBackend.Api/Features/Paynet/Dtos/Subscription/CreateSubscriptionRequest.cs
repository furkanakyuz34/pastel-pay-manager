using System.Text.Json.Serialization;

namespace EgemenLisansYonetimiBackend.Api.Features.Paynet.Dtos.Subscription;

public class CreateSubscriptionRequest
{
    [JsonPropertyName("name_surname")]
    public string NameSurname { get; set; } = default!;

    /// <summary>
    /// Tutar 100 ile çarpılmış olmalı. "10.00 TL" => "1000"
    /// </summary>
    [JsonPropertyName("amount")]
    public string Amount { get; set; } = default!;

    /// <summary>0:Günlük, 1:Haftalık, 2:Aylık, 3:Yıllık</summary>
    [JsonPropertyName("interval")]
    public int Interval { get; set; }

    [JsonPropertyName("interval_count")]
    public int IntervalCount { get; set; }

    /// <summary>Örn: 2017-08-14T16:44:49.9405776+03:00</summary>
    [JsonPropertyName("begin_date")]
    public string BeginDate { get; set; } = default!;

    [JsonPropertyName("reference_no")]
    public string ReferenceNo { get; set; } = default!;

    [JsonPropertyName("end_user_email")]
    public string EndUserEmail { get; set; } = default!;

    [JsonPropertyName("end_user_gsm")]
    public string EndUserGsm { get; set; } = default!;

    [JsonPropertyName("agent_id")]
    public string? AgentId { get; set; }

    [JsonPropertyName("agent_amount")]
    public string? AgentAmount { get; set; }

    [JsonPropertyName("company_amount")]
    public string? CompanyAmount { get; set; }

    [JsonPropertyName("end_user_desc")]
    public string EndUserDesc { get; set; } = default!;

    // Dokümanda bu isim bu şekilde geçiyor
    [JsonPropertyName("add_comission_to_amount")]
    public bool? AddComissionToAmount { get; set; }

    [JsonPropertyName("currency")]
    public string? Currency { get; set; } // sadece TL

    [JsonPropertyName("period")]
    public int? Period { get; set; }

    [JsonPropertyName("user_name")]
    public string? UserName { get; set; }

    [JsonPropertyName("agent_note")]
    public string? AgentNote { get; set; }

    [JsonPropertyName("confirmation_webhook")]
    public string? ConfirmationWebhook { get; set; }

    // Dokümanda "suceed_webhook" yazıyor
    [JsonPropertyName("suceed_webhook")]
    public string? SuceedWebhook { get; set; }

    [JsonPropertyName("error_webhook")]
    public string? ErrorWebhook { get; set; }

    [JsonPropertyName("confirmation_redirect_url")]
    public string? ConfirmationRedirectUrl { get; set; }

    [JsonPropertyName("send_mail")]
    public bool? SendMail { get; set; }

    [JsonPropertyName("send_sms")]
    public bool? SendSms { get; set; }

    [JsonPropertyName("is_fixed_price")]
    public bool? IsFixedPrice { get; set; }

    [JsonPropertyName("auto_renew")]
    public bool? AutoRenew { get; set; }

    [JsonPropertyName("agent_logo")]
    public string? AgentLogo { get; set; }

    [JsonPropertyName("attempt_day_count")]
    public int? AttemptDayCount { get; set; }

    [JsonPropertyName("daily_attempt_count")]
    public int? DailyAttemptCount { get; set; }

    [JsonPropertyName("is_charge_on_card_confirmation")]
    public bool? IsChargeOnCardConfirmation { get; set; }

    [JsonPropertyName("group_reference_no")]
    public string? GroupReferenceNo { get; set; }

    [JsonPropertyName("otp_control")]
    public bool? OtpControl { get; set; }
}
