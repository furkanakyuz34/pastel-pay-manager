using FirebirdSql.Data.FirebirdClient;

namespace EgemenLisansYonetimiBackend.Api.Infrastructure.Db
{
    public sealed class FirebirdConnectionFactory : IDbConnectionFactory
    {
        private readonly string _cs;

        public FirebirdConnectionFactory(IConfiguration cfg)
            => _cs = cfg.GetConnectionString("Firebird")
                ?? throw new Exception("ConnectionStrings:Firebird missing.");

        public FbConnection Create() => new FbConnection(_cs);
    }
}
