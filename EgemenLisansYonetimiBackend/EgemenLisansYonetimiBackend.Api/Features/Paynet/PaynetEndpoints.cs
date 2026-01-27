namespace EgemenLisansYonetimiBackend.Api.Features.Paynet;

public static class PaynetEndpoints
{
    public const string SubscriptionCreate = "/v1/subscription/create";
    public const string SubscriptionDetail = "/v1/subscription/detail";
    public const string SubscriptionCancel = "/v1/subscription/cancel";
    public const string SubscriptionTransactions = "/v1/subscription/transactions";

    public const string TransactionCharge = "/v1/transaction/charge";
    public const string TransactionDetail = "/v1/transaction/detail";
    public const string TransactionRefund = "/v1/transaction/refund";

    public const string TokenCreate = "/v1/token/create";
    public const string SessionCreate = "/v1/session/create";
   
}
