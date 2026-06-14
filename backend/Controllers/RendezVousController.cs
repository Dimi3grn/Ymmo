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
public class RendezVousController : ApiControllerBase
{
    private readonly YmmoDbContext _db;

    public RendezVousController(YmmoDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<List<RendezVousDTO>>> GetMine()
    {
        var userId = CurrentUserId;
        var role = CurrentUserRole;

        var query = _db.RendezVous
            .Include(r => r.Bien)
            .Include(r => r.Client)
            .Include(r => r.Agent)
            .AsQueryable();

        query = role switch
        {
            "Client" => query.Where(r => r.ClientId == userId),
            "Agent" or "AdminAgence" => query.Where(r => r.AgentId == userId),
            "AdminSiege" => query,
            _ => query.Where(r => r.ClientId == userId)
        };

        var rdvs = await query.OrderByDescending(r => r.DateHeure).ToListAsync();
        return Ok(rdvs.Select(MapToDTO));
    }

    [HttpPost]
    public async Task<ActionResult<RendezVousDTO>> Create(CreateRendezVousDTO dto)
    {
        var bien = await _db.Biens.Include(b => b.Agent).FirstOrDefaultAsync(b => b.Id == dto.BienId);
        if (bien is null)
            return NotFound(new { message = "Bien introuvable." });

        var agentId = bien.AgentId ?? (await _db.Utilisateurs
            .Where(u => u.AgenceId == bien.AgenceId && (u.Role == RoleUtilisateur.Agent || u.Role == RoleUtilisateur.AdminAgence))
            .Select(u => (int?)u.Id)
            .FirstOrDefaultAsync());

        if (agentId is null)
            return BadRequest(new { message = "Aucun agent disponible pour ce bien." });

        var rdv = new RendezVous
        {
            DateHeure = dto.DateHeure,
            Notes = dto.Notes,
            BienId = dto.BienId,
            ClientId = CurrentUserId,
            AgentId = agentId.Value
        };

        _db.RendezVous.Add(rdv);
        await _db.SaveChangesAsync();

        var created = await _db.RendezVous
            .Include(r => r.Bien).Include(r => r.Client).Include(r => r.Agent)
            .FirstAsync(r => r.Id == rdv.Id);

        return CreatedAtAction(nameof(GetMine), MapToDTO(created));
    }

    [HttpPatch("{id}/statut")]
    [Authorize(Roles = "Agent,AdminAgence,AdminSiege")]
    public async Task<ActionResult<RendezVousDTO>> UpdateStatut(int id, [FromBody] UpdateTransactionStatutDTO dto)
    {
        var rdv = await _db.RendezVous
            .Include(r => r.Bien).Include(r => r.Client).Include(r => r.Agent)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (rdv is null) return NotFound();
        if (!Enum.TryParse<StatutRendezVous>(dto.Statut, true, out var statut))
            return BadRequest(new { message = "Statut invalide." });

        rdv.Statut = statut;
        await _db.SaveChangesAsync();
        return Ok(MapToDTO(rdv));
    }

    private static RendezVousDTO MapToDTO(RendezVous r) => new()
    {
        Id = r.Id,
        DateHeure = r.DateHeure,
        Notes = r.Notes,
        Statut = r.Statut.ToString(),
        BienId = r.BienId,
        BienTitre = r.Bien?.Titre ?? "",
        BienVille = r.Bien?.Ville ?? "",
        ClientId = r.ClientId,
        ClientNom = r.Client != null ? $"{r.Client.Prenom} {r.Client.Nom}" : "",
        ClientEmail = r.Client?.Email ?? "",
        ClientTelephone = r.Client?.Telephone,
        AgentId = r.AgentId,
        AgentNom = r.Agent != null ? $"{r.Agent.Prenom} {r.Agent.Nom}" : ""
    };
}
