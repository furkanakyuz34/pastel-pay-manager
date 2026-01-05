using EgemenLisansYonetimiBackend.Api.Common;
using EgemenLisansYonetimiBackend.Api.Features.Auth;
using EgemenLisansYonetimiBackend.Api.Features.Firma;
using EgemenLisansYonetimiBackend.Api.Features.Paynet;
using EgemenLisansYonetimiBackend.Api.Features.Proje;
using EgemenLisansYonetimiBackend.Api.Features.ProjeModul;
using EgemenLisansYonetimiBackend.Api.Infrastructure.Db;
using EgemenLisansYonetimiBackend.Api.Infrastructure.Logging;
using EgemenLisansYonetimiBackend.Api.Infrastructure.Security;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// -------------------- Serilog --------------------
builder.Host.UseSerilog((ctx, services, cfg) =>
{
    cfg.ReadFrom.Configuration(ctx.Configuration)
       .ReadFrom.Services(services)
       .WriteTo.Console(); // Konsolda da gözüksün
});

// -------------------- MVC --------------------
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
// builder.Services.AddSwaggerGen();

// -------------------- DI --------------------
builder.Services.AddSingleton<IDbConnectionFactory, FirebirdConnectionFactory>();

builder.Services.AddScoped<UserRepository>();
builder.Services.AddSingleton<JwtTokenService>();

builder.Services.AddScoped<FirmaRepository>();
builder.Services.AddScoped<ProjeRepository>();
builder.Services.AddScoped<ProjeModulRepository>();

builder.Services.AddScoped<PaynetWebhookRepository>();
builder.Services.AddScoped<PaynetRepository>();

// -------------------- Options --------------------
builder.Services.Configure<PaynetOptions>(builder.Configuration.GetSection("Paynet"));

// -------------------- HttpClient (Paynet) --------------------
builder.Services.AddHttpClient<PaynetClient>((sp, client) =>
{
    var opt = sp.GetRequiredService<IOptions<PaynetOptions>>().Value;

    if (string.IsNullOrWhiteSpace(opt.BaseUrl))
        throw new InvalidOperationException("Paynet config eksik: Paynet:BaseUrl");

    if (string.IsNullOrWhiteSpace(opt.SecretKey))
        throw new InvalidOperationException("Paynet config eksik: Paynet:SecretKey");

    client.BaseAddress = new Uri(opt.BaseUrl.TrimEnd('/'));
    client.Timeout = TimeSpan.FromSeconds(opt.TimeoutSeconds <= 0 ? 30 : opt.TimeoutSeconds);

    // Paynet: Basic {secret_key} (base64 deðil)
    client.DefaultRequestHeaders.TryAddWithoutValidation("Authorization", $"Basic {opt.SecretKey}");

    // Accept
    client.DefaultRequestHeaders.Accept.ParseAdd("application/json");
});

// -------------------- CORS --------------------
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader());
});

// -------------------- JWT --------------------
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

var app = builder.Build();

// -------------------- Middlewares --------------------
// app.UseSwagger();
// app.UseSwaggerUI();

// CorrelationId
app.UseMiddleware<CorrelationIdMiddleware>();

// Request log
app.UseSerilogRequestLogging(options =>
{
    options.MessageTemplate = "HTTP {RequestMethod} {RequestPath} => {StatusCode} in {Elapsed:0.0000} ms";
});

// Exception Handling (log + standart response)
app.UseMiddleware<ExceptionMiddleware>();

// CORS (policy'yi burada mutlaka uygula)
app.UseCors("AllowAll");

// Auth
app.UseAuthentication();
app.UseAuthorization();

// Controllers
app.MapControllers();

// Basit health endpoint (istersen kalsýn)
app.MapGet("/health", () => Results.Ok(new { ok = true }));

app.Run();
