using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using YmmoAPI.Interfaces;
using YmmoAPI.Models;

namespace YmmoAPI.Services;

/// <summary>
/// Implémentation de IAuthService — principe Dependency Inversion (SOLID-D)
/// Le controller dépend de l'interface, pas de cette classe concrète
/// </summary>
public class AuthService : IAuthService
{
    private readonly IConfiguration _config;

    public AuthService(IConfiguration config)
    {
        _config = config;
    }

    public string GenererToken(Utilisateur utilisateur)
    {
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, utilisateur.Id.ToString()),
            new(ClaimTypes.Email, utilisateur.Email),
            new(ClaimTypes.Role, utilisateur.Role.ToString()),
            new("nom", utilisateur.Nom),
            new("prenom", utilisateur.Prenom),
        };

        // Permet aux controllers de connaître l'agence de l'utilisateur sans requête DB
        if (utilisateur.AgenceId.HasValue)
            claims.Add(new Claim("agenceId", utilisateur.AgenceId.Value.ToString()));

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
