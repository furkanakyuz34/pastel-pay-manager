namespace EgemenLisansYonetimiBackend.Api.Features.Paynet.Dtos.Transaction
{
    public class ChargeRequest
    {
        public string SessionId { get; set; } = default!;
        public string TokenId { get; set; } = default!;
        public int TransactionType { get; set; } = 1;
    }
}
