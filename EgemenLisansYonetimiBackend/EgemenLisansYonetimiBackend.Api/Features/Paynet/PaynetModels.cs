namespace EgemenLisansYonetimiBackend.Api.Features.Paynet;

/// <summary>
/// UI planı buraya basar.
/// UsePaynet=true ise Paynet subscription/create çağrılır.
/// </summary>
public sealed class CreateSozlesmePlanRequest
{
    public long SozlesmeId { get; set; }
    public bool UsePaynet { get; set; }

    public string NameSurname { get; set; } = default!;
    public decimal TotalAmount { get; set; }          // TL (örn: 100.50)
    public int Interval { get; set; }                 // 0/1/2/3
    public int IntervalCount { get; set; }            // örn 1

    public DateTime BeginDate { get; set; }           // UI tarih seçer

    public string ReferenceNo { get; set; } = default!;
    public string EndUserEmail { get; set; } = default!;
    public string EndUserGsm { get; set; } = default!;
    public string EndUserDesc { get; set; } = default!;

    // opsiyoneller
    public string? AgentId { get; set; }
    public decimal? AgentAmount { get; set; }         // TL
    public decimal? CompanyAmount { get; set; }       // TL
    public bool? AddComissionToAmount { get; set; }
    public string? Currency { get; set; }             // "TL"
    public int? Period { get; set; }
    public string? UserName { get; set; }
    public string? AgentNote { get; set; }

    public string? ConfirmationWebhook { get; set; }
    public string? SuceedWebhook { get; set; }
    public string? ErrorWebhook { get; set; }
    public string? ConfirmationRedirectUrl { get; set; }

    public bool? SendMail { get; set; }
    public bool? SendSms { get; set; }
    public bool? IsFixedPrice { get; set; }
    public bool? AutoRenew { get; set; }
    public string? AgentLogo { get; set; }

    public int? AttemptDayCount { get; set; }
    public int? DailyAttemptCount { get; set; }
    public bool? IsChargeOnCardConfirmation { get; set; }
    public string? GroupReferenceNo { get; set; }
    public bool? OtpControl { get; set; }

    public List<CreateSozlesmePlanItemRequest> Items { get; set; } = new();
}

public sealed class CreateSozlesmePlanItemRequest
{
    public int Sira { get; set; }
    public DateTime? ValDate { get; set; }
    public decimal Amount { get; set; }      // TL
    public string? InvoiceId { get; set; }
}

public sealed class CreateSozlesmePlanResponse
{
    public long SozlesmePlanId { get; set; }
    public bool UsePaynet { get; set; }

    public int? PaynetCode { get; set; }
    public string? PaynetMessage { get; set; }

    public string? SubscriptionId { get; set; }
    public string? Url { get; set; }         // Paynet onay sayfası
}
