namespace EgemenLisansYonetimiBackend.Api.Features.Paynet.Dtos.Common
{
    public class PaynetBaseResponse<T>
    {
        public bool IsSucceed { get; set; }
        public string? Message { get; set; }
        public T? Data { get; set; }
    }

}
