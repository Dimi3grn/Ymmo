using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using YmmoAPI.Data;
using YmmoAPI.DTOs;
using YmmoAPI.Interfaces;
using YmmoAPI.Models;

namespace YmmoAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly YmmoDbContext _db;
    private readonly IAuthService _auth;

    public AuthController(YmmoDbContext db, IAuthService auth)
    {
        _db = db;
        _auth = auth;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDTO>> Register(RegisterDTO dto)
    {
        if (await _db.Utilisateurs.AnyAsync(u => u.Email == dto.Email))
            return Conflict(new { message = "Cet email est déjà utilisé." });

        var utilisateur = new Utilisateur
        {
            Nom = dto.Nom,
            Prenom = dto.Prenom,
            Email = dto.Email,
            MotDePasseHash = BCrypt.Net.BCrypt.HashPassword(dto.MotDePasse),
            Telephone = dto.Telephone,
            Role = RoleUtilisateur.Client
        };

        _db.Utilisateurs.Add(utilisateur);
        await _db.SaveChangesAsync();

        return Ok(new AuthResponseDTO
        {
            Token = _auth.GenererToken(utilisateur),
            Utilisateur = MapToDTO(utilisateur)
        });
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDTO>> Login(LoginDTO dto)
    {
        var utilisateur = await _db.Utilisateurs
            .Include(u => u.Agence)
            .FirstOrDefaultAsync(u => u.Email == dto.Email);

        if (utilisateur == null || !BCrypt.Net.BCrypt.Verify(dto.MotDePasse, utilisateur.MotDePasseHash))
            return Unauthorized(new { message = "Email ou mot de passe incorrect." });

        return Ok(new AuthResponseDTO
        {
            Token = _auth.GenererToken(utilisateur),
            Utilisateur = MapToDTO(utilisateur)
        });
    }

    private static UtilisateurDTO MapToDTO(Utilisateur u) => new()
    {
        Id = u.Id,
        Nom = u.Nom,
        Prenom = u.Prenom,
        Email = u.Email,
        Telephone = u.Telephone,
        Role = u.Role.ToString(),
        AgenceId = u.AgenceId,
        AgenceNom = u.Agence?.Nom
    };
}
