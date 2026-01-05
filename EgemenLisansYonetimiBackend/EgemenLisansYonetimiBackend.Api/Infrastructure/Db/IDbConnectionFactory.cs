using FirebirdSql.Data.FirebirdClient;

namespace EgemenLisansYonetimiBackend.Api.Infrastructure.Db
{

    public interface IDbConnectionFactory
    {
        FbConnection Create();
    }
}
