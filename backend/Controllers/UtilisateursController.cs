using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using YmmoAPI.Data;
using YmmoAPI.DTOs;
using YmmoAPI.Models;

namespace YmmoAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UtilisateursController : ControllerBase
{
    private readonly YmmoDbContext _db;

    public UtilisateursController(YmmoDbContext db) => _db = db;

    [HttpGet("me")]
    public async Task<ActionResult<UtilisateurDTO>> GetMe()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var user = await _db.Utilisateurs.Include(u => u.Agence).FirstOrDefaultAsync(u => u.Id == userId);
        if (user is null) return NotFound();
        return Ok(MapToDTO(user));
    }

    [HttpGet("clients")]
    [Authorize(Roles = "Agent,AdminAgence,AdminSiege")]
    public async Task<IActionResult> GetClients()
    {
        var clients = await _db.Utilisateurs
            .Where(u => u.Role == RoleUtilisateur.Client)
            .OrderBy(u => u.Nom)
            .Select(u => new { u.Id, u.Nom, u.Prenom, u.Email, u.Telephone, u.DateCreation })
            .ToListAsync();
        return Ok(clients);
    }

    [HttpGet("agents")]
    [Authorize(Roles = "AdminAgence,AdminSiege")]
    public async Task<IActionResult> GetAgents()
    {
        var agents = await _db.Utilisateurs
            .Where(u => u.Role == RoleUtilisateur.Agent || u.Role == RoleUtilisateur.AdminAgence)
            .Include(u => u.Agence)
            .OrderBy(u => u.Nom)
            .Select(u => new { u.Id, u.Nom, u.Prenom, u.Email, u.Telephone, Role = u.Role.ToString(), AgenceNom = u.Agence != null ? u.Agence.Nom : null })
            .ToListAsync();
        return Ok(agents);
    }

    [HttpGet("all")]
    [Authorize(Roles = "AdminSiege")]
    public async Task<IActionResult> GetAll()
    {
        var users = await _db.Utilisateurs
            .Include(u => u.Agence)
            .OrderBy(u => u.Role).ThenBy(u => u.Nom)
            .Select(u => new
            {
                u.Id, u.Nom, u.Prenom, u.Email, u.Telephone,
                Role = u.Role.ToString(),
                u.AgenceId,
                AgenceNom = u.Agence != null ? u.Agence.Nom : null,
                u.DateCreation
            })
            .ToListAsync();
        return Ok(users);
    }

    [HttpPut("{id}/role")]
    [Authorize(Roles = "AdminSiege")]
    public async Task<IActionResult> UpdateRole(int id, [FromBody] UpdateRoleDTO dto)
    {
        var user = await _db.Utilisateurs.FindAsync(id);
        if (user is null) return NotFound(new { message = "Utilisateur introuvable" });

        if (!Enum.TryParse<RoleUtilisateur>(dto.Role, true, out var newRole))
            return BadRequest(new { message = "Rôle invalide. Valeurs : Client, Agent, AdminAgence, AdminSiege" });

        if (newRole == RoleUtilisateur.Agent || newRole == RoleUtilisateur.AdminAgence)
        {
            if (dto.AgenceId is null)
                return BadRequest(new { message = "AgenceId requis pour le rôle Agent ou AdminAgence" });

            var agence = await _db.Agences.FindAsync(dto.AgenceId.Value);
            if (agence is null)
                return BadRequest(new { message = "Agence introuvable" });

            user.AgenceId = dto.AgenceId;
        }
        else
        {
            user.AgenceId = null;
        }

        user.Role = newRole;
        await _db.SaveChangesAsync();

        await _db.Entry(user).Reference(u => u.Agence).LoadAsync();
        return Ok(MapToDTO(user));
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
