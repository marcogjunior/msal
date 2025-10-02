
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

var tenantId      = Environment.GetEnvironmentVariable("TENANT_ID")     ?? "6dbb1d5c-d749-4eda-9302-4967a4675d09";
var apiAudience   = Environment.GetEnvironmentVariable("API_IDENTIFIER") ?? "api://97569815-6fd5-4d2c-9057-c7dc2c239daf";
var requiredScope = Environment.GetEnvironmentVariable("API_SCOPE")      ?? "api://97569815-6fd5-4d2c-9057-c7dc2c239daf/access_as_user";

builder.Services
  .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
  .AddJwtBearer(options =>
  {
      options.Authority = $"https://login.microsoftonline.com/{tenantId}/v2.0";
      options.TokenValidationParameters = new TokenValidationParameters
      {
          ValidAudience = apiAudience,
          ValidateAudience = true,
          ValidateIssuer = true
      };
  });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("ApiScope", policy =>
        policy.RequireAssertion(ctx =>
        {
            var scp = ctx.User.FindFirst("scp")?.Value?.Split(' ', StringSplitOptions.RemoveEmptyEntries) ?? Array.Empty<string>();
            var roles = ctx.User.FindAll("roles").SelectMany(r => r.Value.Split(' ', StringSplitOptions.RemoveEmptyEntries));
            return scp.Contains(requiredScope) || roles.Contains(requiredScope);
        }));
});

var app = builder.Build();
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/public/ping", () => new { ok = true, ts = DateTimeOffset.UtcNow });
app.MapGet("/api/profile", (System.Security.Claims.ClaimsPrincipal user) =>
{
    var name = user.Identity?.Name ?? user.FindFirst("name")?.Value ?? "unknown";
    return new { user = name, sub = user.FindFirst("sub")?.Value };
}).RequireAuthorization("ApiScope");

app.Run();
