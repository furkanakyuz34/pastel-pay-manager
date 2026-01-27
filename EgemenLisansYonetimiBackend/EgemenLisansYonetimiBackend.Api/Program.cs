using EgemenLisansYonetimiBackend.Api.Common;
using EgemenLisansYonetimiBackend.Api.Features.Auth;
using EgemenLisansYonetimiBackend.Api.Features.Firma;
using EgemenLisansYonetimiBackend.Api.Features.OdemeTipi;
using EgemenLisansYonetimiBackend.Api.Features.OdemeYontemi;
using EgemenLisansYonetimiBackend.Api.Features.Paynet;
using EgemenLisansYonetimiBackend.Api.Features.Proje;
using EgemenLisansYonetimiBackend.Api.Features.ProjeModul;
using EgemenLisansYonetimiBackend.Api.Features.Sample;
using EgemenLisansYonetimiBackend.Api.Features.Sozlesme;
using EgemenLisansYonetimiBackend.Api.Features.SozlesmeModul;
using EgemenLisansYonetimiBackend.Api.Features.SozlesmeOdeme;
using EgemenLisansYonetimiBackend.Api.Features.SozlesmePlani;
using EgemenLisansYonetimiBackend.Api.Infrastructure.Db;
using EgemenLisansYonetimiBackend.Api.Infrastructure.Logging;
using EgemenLisansYonetimiBackend.Api.Infrastructure.Security;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using Serilog;
using System.Text;


var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((ctx, services, cfg) =>
{
    cfg.ReadFrom.Configuration(ctx.Configuration)
       .ReadFrom.Services(services)
       .WriteTo.Console(); 
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSingleton<IDbConnectionFactory, FirebirdConnectionFactory>();

builder.Services.AddScoped<UserRepository>();
builder.Services.AddSingleton<JwtTokenService>();

builder.Services.AddScoped<FirmaRepository>();
builder.Services.AddScoped<ProjeRepository>();
builder.Services.AddScoped<ProjeModulRepository>();

builder.Services.AddScoped<SozlesmeRepository>();
builder.Services.AddScoped<SozlesmeModulRepository>();
builder.Services.AddScoped<SozlesmePlaniRepository>();
builder.Services.AddScoped<SozlesmeOdemeRepository>();
builder.Services.AddScoped<OdemeYontemiRepository>();
builder.Services.AddScoped<OdemeTipiRepository>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<SampleService>();

builder.Services.Configure<PaynetOptions>(builder.Configuration.GetSection("Paynet"));

builder.Services.AddHttpClient<PaynetClient>((sp, client) =>
{
    var opt = sp.GetRequiredService<IOptions<PaynetOptions>>().Value;

    if (string.IsNullOrWhiteSpace(opt.BaseUrl))
        throw new InvalidOperationException("Paynet config eksik: Paynet:BaseUrl");

    if (string.IsNullOrWhiteSpace(opt.SecretKey))
        throw new InvalidOperationException("Paynet config eksik: Paynet:SecretKey");

    client.BaseAddress = new Uri(opt.BaseUrl.TrimEnd('/'));
    client.Timeout = TimeSpan.FromSeconds(opt.TimeoutSeconds <= 0 ? 30 : opt.TimeoutSeconds);

    client.DefaultRequestHeaders.TryAddWithoutValidation("Authorization", $"Basic {opt.SecretKey}");


    client.DefaultRequestHeaders.Accept.ParseAdd("application/json");
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader());
});

var jwtSection = builder.Configuration.GetSection("Jwt");
var issuer = jwtSection["Issuer"];
var audience = jwtSection["Audience"];
var key = jwtSection["Key"];

if (string.IsNullOrWhiteSpace(issuer) ||
    string.IsNullOrWhiteSpace(audience) ||
    string.IsNullOrWhiteSpace(key))
{
    throw new InvalidOperationException("Jwt config eksik: Jwt:Issuer / Jwt:Audience / Jwt:Key");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = issuer,
            ValidAudience = audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            ClockSkew = TimeSpan.FromSeconds(10)
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddOpenApi();
var app = builder.Build();


app.MapOpenApi();

app.MapScalarApiReference(opt =>
{
    opt.WithTitle("EgemenLicense API");
    opt.WithEndpointPrefix("docs"); 
    opt.WithTheme(ScalarTheme.Kepler);

    opt.Authentication = new ScalarAuthenticationOptions
    {
        PreferredSecurityScheme = "Bearer"
    };
});


app.UseMiddleware<CorrelationIdMiddleware>();

app.UseSerilogRequestLogging(options =>
{
    options.MessageTemplate = "HTTP {RequestMethod} {RequestPath} => {StatusCode} in {Elapsed:0.0000} ms";
});

app.UseMiddleware<ExceptionMiddleware>();

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapGet("/health", () => Results.Ok(new { ok = true }));

app.Run();
