using EgemenLisansYonetimiBackend.Api.Features.Paynet.Dtos.Common;

namespace EgemenLisansYonetimiBackend.Api.Features.Paynet.Dtos.Transaction
{
    public class ChargeResponse
     : PaynetBaseResponse<ChargeData>
    {
    }

    public class ChargeData
    {
        public string? XactId { get; set; }
    }
}
