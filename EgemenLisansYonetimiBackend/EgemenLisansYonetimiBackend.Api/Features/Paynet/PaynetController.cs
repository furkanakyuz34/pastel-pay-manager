using EgemenLisansYonetimiBackend.Api.Common;
using EgemenLisansYonetimiBackend.Api.Features.Paynet.Dtos.Subscription;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EgemenLisansYonetimiBackend.Api.Features.Paynet;

[ApiController]
[Route("api/paynet")]
[Authorize]
public sealed class PaynetController : ControllerBase
{
    private readonly PaynetRepository _repo;
    private readonly PaynetClient _paynet;
    private readonly ILogger<PaynetController> _logger;

    public PaynetController(
        PaynetRepository repo,
        PaynetClient paynet,
        ILogger<PaynetController> logger)
    {
        _repo = repo;
        _paynet = paynet;
        _logger = logger;
    }


    /// <summary>
    /// UI: Plan + Detayları DB'ye yazar.
    /// UsePaynet=true ise Paynet subscription/create çağrılır.
    /// </summary>
    [HttpPost("plans")]
    public async Task<IActionResult> CreatePlan(
        [FromBody] CreateSozlesmePlanRequest req,
        CancellationToken ct)
    {
        var traceId = HttpContext.TraceIdentifier;

        /* ------------------ VALIDATION ------------------ */
        if (req.SozlesmeId <= 0)
            return BadRequest(ApiResponse<object>.Fail(
                code: "VALIDATION_ERROR",
                detail: "SozlesmeId zorunlu.",
                traceId: traceId));

        if (string.IsNullOrWhiteSpace(req.NameSurname))
            return BadRequest(ApiResponse<object>.Fail(
                code: "VALIDATION_ERROR",
                detail: "NameSurname zorunlu.",
                traceId: traceId));

        if (req.TotalAmount <= 0)
            return BadRequest(ApiResponse<object>.Fail(
                code: "VALIDATION_ERROR",
                detail: "TotalAmount 0'dan büyük olmalı.",
                traceId: traceId));

        if (req.Items is null || req.Items.Count == 0)
            return BadRequest(ApiResponse<object>.Fail(
                code: "VALIDATION_ERROR",
                detail: "En az 1 adet taksit (item) gerekli.",
                traceId: traceId));

        var userId = CurrentUser.GetUserId(User);

        if (userId <= 0)
        {
            return Unauthorized(ApiResponse<object>.Fail(
                code: "UNAUTHORIZED",
                detail: "Kullanıcı kimliği alınamadı.",
                traceId: traceId));
        }
        var corrId = traceId;

        /* ------------------ DB INSERT ------------------ */
        var insertCmd = new InsertPlanCommand
        {
            SozlesmeId = req.SozlesmeId,
            UsePaynet = req.UsePaynet,
            NameSurname = req.NameSurname,
            TotalAmount = req.TotalAmount,
            UserId = userId,
            Items = req.Items.Select(x => new InsertPlanItem
            {
                Sira = x.Sira,
                ValDate = x.ValDate,
                Amount = x.Amount,
                InvoiceId = x.InvoiceId
            }).ToList()
        };

        var planId = await _repo.InsertPlanAndItemsAsync(insertCmd, ct);

        /* ------------------ NO PAYNET ------------------ */
        if (!req.UsePaynet)
        {
            var noPaynetRes = new CreateSozlesmePlanResponse
            {
                SozlesmePlanId = planId,
                UsePaynet = false
            };

            return Ok(ApiResponse<CreateSozlesmePlanResponse>.Ok(
                noPaynetRes,
                message: "Plan kaydedildi (Paynet kullanılmadı).",
                traceId: traceId));
        }

        /* ------------------ PAYNET REQUEST ------------------ */
        var paynetReq = BuildPaynetRequest(req);

        CreateSubscriptionResponse paynetResp;
        try
        {
            paynetResp = await _paynet.CreateSubscriptionAsync(paynetReq, corrId, ct);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Paynet CreateSubscription exception. PlanId={PlanId} TraceId={TraceId}",
                planId, traceId);

            await _repo.UpdatePlanPaynetResultAsync(new UpdatePaynetResultCommand
            {
                SozlesmePlanId = planId,
                Code = -1,
                Message = ex.Message,
                SubscriptionId = null,
                Url = null
            }, ct);

            var errRes = new CreateSozlesmePlanResponse
            {
                SozlesmePlanId = planId,
                UsePaynet = true,
                PaynetCode = -1,
                PaynetMessage = ex.Message
            };

            return Ok(ApiResponse<CreateSozlesmePlanResponse>.Ok(
                errRes,
                message: "Plan kaydedildi fakat Paynet çağrısı başarısız oldu.",
                traceId: traceId));
        }

        /* ------------------ DB UPDATE ------------------ */
        await _repo.UpdatePlanPaynetResultAsync(new UpdatePaynetResultCommand
        {
            SozlesmePlanId = planId,
            Code = paynetResp.Code,
            Message = paynetResp.Message,
            SubscriptionId = paynetResp.SubscriptionId,
            Url = paynetResp.Url
        }, ct);

        var res = new CreateSozlesmePlanResponse
        {
            SozlesmePlanId = planId,
            UsePaynet = true,
            PaynetCode = paynetResp.Code,
            PaynetMessage = paynetResp.Message,
            SubscriptionId = paynetResp.SubscriptionId,
            Url = paynetResp.Url
        };

        var msg = paynetResp.Code == 0
            ? "Plan kaydedildi ve Paynet aboneliği oluşturuldu."
            : $"Plan kaydedildi fakat Paynet hata döndü: {paynetResp.Message}";

        return Ok(ApiResponse<CreateSozlesmePlanResponse>.Ok(
            res,
            message: msg,
            traceId: traceId));
    }

    /* ------------------ HELPERS ------------------ */

    private static CreateSubscriptionRequest BuildPaynetRequest(CreateSozlesmePlanRequest req)
    {
        return new CreateSubscriptionRequest
        {
            NameSurname = req.NameSurname,
            Amount = ToPaynetAmount(req.TotalAmount),
            Interval = req.Interval,
            IntervalCount = req.IntervalCount,
            BeginDate = req.BeginDate.ToString("yyyy-MM-ddTHH:mm:ss.fffffffzzz"),
            ReferenceNo = req.ReferenceNo,
            EndUserEmail = req.EndUserEmail,
            EndUserGsm = req.EndUserGsm,
            EndUserDesc = req.EndUserDesc,

            AgentId = req.AgentId,
            AgentAmount = req.AgentAmount.HasValue ? ToPaynetAmount(req.AgentAmount.Value) : null,
            CompanyAmount = req.CompanyAmount.HasValue ? ToPaynetAmount(req.CompanyAmount.Value) : null,
            AddComissionToAmount = req.AddComissionToAmount,
            Currency = string.IsNullOrWhiteSpace(req.Currency) ? "TL" : req.Currency,
            Period = req.Period,
            UserName = req.UserName,
            AgentNote = req.AgentNote,

            ConfirmationWebhook = req.ConfirmationWebhook,
            SuceedWebhook = req.SuceedWebhook,
            ErrorWebhook = req.ErrorWebhook,
            ConfirmationRedirectUrl = req.ConfirmationRedirectUrl,

            SendMail = req.SendMail,
            SendSms = req.SendSms,
            IsFixedPrice = req.IsFixedPrice,
            AutoRenew = req.AutoRenew,
            AgentLogo = req.AgentLogo,

            AttemptDayCount = req.AttemptDayCount,
            DailyAttemptCount = req.DailyAttemptCount,
            IsChargeOnCardConfirmation = req.IsChargeOnCardConfirmation,
            GroupReferenceNo = req.GroupReferenceNo,
            OtpControl = req.OtpControl
        };
    }

    private static string ToPaynetAmount(decimal tl)
    {
        var kurus = decimal.Round(tl * 100m, 0, MidpointRounding.AwayFromZero);
        return kurus.ToString("0");
    }
}
