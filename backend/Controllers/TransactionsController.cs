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
public class TransactionsController : ApiControllerBase
{
    private readonly YmmoDbContext _db;

    public TransactionsController(YmmoDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<List<TransactionDTO>>> GetAll()
    {
        var userId = CurrentUserId;
        var role = CurrentUserRole;
        var agenceId = CurrentUserAgenceId;

        var query = _db.Transactions
            .Include(t => t.Bien)
            .Include(t => t.Acheteur)
            .Include(t => t.Vendeur)
            .Include(t => t.Agent)
            .AsQueryable();

        query = role switch
        {
            // Un agent ne voit que ses transactions ; un admin d'agence voit
            // toutes les transactions des biens de son agence ; le siège voit tout.
            "Agent" => query.Where(t => t.AgentId == userId),
            "AdminAgence" => query.Where(t => t.Bien.AgenceId == agenceId),
            "AdminSiege" => query,
            _ => query.Where(t => t.AcheteurId == userId || t.VendeurId == userId)
        };

        var transactions = await query.OrderByDescending(t => t.DateCreation).ToListAsync();
        return Ok(transactions.Select(MapToDTO));
    }

    [HttpPost]
    [Authorize(Roles = "Agent,AdminAgence,AdminSiege")]
    public async Task<ActionResult<TransactionDTO>> Create(CreateTransactionDTO dto)
    {
        var bien = await _db.Biens.FindAsync(dto.BienId);
        if (bien is null) return NotFound(new { message = "Bien introuvable." });

        // Vérifie les parties avant insertion pour éviter une violation de clé
        // étrangère (qui se traduirait sinon par une 500 non gérée).
        if (!await _db.Utilisateurs.AnyAsync(u => u.Id == dto.AcheteurId))
            return BadRequest(new { message = "Acheteur introuvable." });
        if (!await _db.Utilisateurs.AnyAsync(u => u.Id == dto.VendeurId))
            return BadRequest(new { message = "Vendeur introuvable." });

        var transaction = new Transaction
        {
            BienId = dto.BienId,
            AcheteurId = dto.AcheteurId,
            VendeurId = dto.VendeurId,
            MontantFinal = dto.MontantFinal,
            AgentId = CurrentUserId
        };

        bien.Statut = StatutBien.SousCompromis;

        _db.Transactions.Add(transaction);
        await _db.SaveChangesAsync();

        var created = await _db.Transactions
            .Include(t => t.Bien).Include(t => t.Acheteur).Include(t => t.Vendeur).Include(t => t.Agent)
            .FirstAsync(t => t.Id == transaction.Id);

        return CreatedAtAction(nameof(GetAll), MapToDTO(created));
    }

    [HttpPost("offre")]
    public async Task<IActionResult> SubmitOffer([FromBody] ClientOfferDTO dto)
    {
        var userId = CurrentUserId;

        var rdv = await _db.RendezVous
            .Include(r => r.Bien)
            .FirstOrDefaultAsync(r => r.Id == dto.RendezVousId && r.ClientId == userId);

        if (rdv is null)
            return NotFound(new { message = "Rendez-vous introuvable." });
        if (rdv.Statut != StatutRendezVous.Effectue)
            return BadRequest(new { message = "La visite doit être effectuée avant de faire une offre." });

        var existing = await _db.Transactions
            .AnyAsync(t => t.BienId == rdv.BienId && t.AcheteurId == userId && t.Statut != StatutTransaction.Annulee);
        if (existing)
            return BadRequest(new { message = "Vous avez déjà une offre en cours pour ce bien." });

        var agentId = rdv.AgentId;

        var transaction = new Transaction
        {
            BienId = rdv.BienId,
            AcheteurId = userId,
            VendeurId = agentId,
            MontantFinal = dto.Montant,
            AgentId = agentId
        };

        _db.Transactions.Add(transaction);
        await _db.SaveChangesAsync();

        var created = await _db.Transactions
            .Include(t => t.Bien).Include(t => t.Acheteur).Include(t => t.Vendeur).Include(t => t.Agent)
            .FirstAsync(t => t.Id == transaction.Id);

        return Ok(MapToDTO(created));
    }

    [HttpPatch("{id}/statut")]
    [Authorize(Roles = "Agent,AdminAgence,AdminSiege")]
    public async Task<ActionResult<TransactionDTO>> UpdateStatut(int id, [FromBody] UpdateStatutDTO dto)
    {
        var transaction = await _db.Transactions
            .Include(t => t.Bien).Include(t => t.Acheteur).Include(t => t.Vendeur).Include(t => t.Agent)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (transaction is null) return NotFound();

        // Un agent ne gère que ses transactions, un admin d'agence celles de son agence.
        var autorise = CurrentUserRole switch
        {
            "AdminSiege" => true,
            "AdminAgence" => transaction.Bien.AgenceId == CurrentUserAgenceId,
            "Agent" => transaction.AgentId == CurrentUserId,
            _ => false
        };
        if (!autorise) return Forbid();

        if (!Enum.TryParse<StatutTransaction>(dto.Statut, true, out var statut))
            return BadRequest(new { message = "Statut invalide." });

        transaction.Statut = statut;

        if (statut == StatutTransaction.Finalisee)
        {
            transaction.DateFinalisation = DateTime.UtcNow;
            transaction.Bien.Statut = StatutBien.Vendu;
        }
        else if (statut == StatutTransaction.Annulee)
        {
            transaction.Bien.Statut = StatutBien.Disponible;
        }

        await _db.SaveChangesAsync();
        return Ok(MapToDTO(transaction));
    }

    private static TransactionDTO MapToDTO(Transaction t) => new()
    {
        Id = t.Id,
        MontantFinal = t.MontantFinal,
        Statut = t.Statut.ToString(),
        BienId = t.BienId,
        BienTitre = t.Bien?.Titre ?? "",
        BienVille = t.Bien?.Ville ?? "",
        BienPrix = t.Bien?.Prix ?? 0,
        AcheteurId = t.AcheteurId,
        AcheteurNom = t.Acheteur != null ? $"{t.Acheteur.Prenom} {t.Acheteur.Nom}" : "",
        VendeurId = t.VendeurId,
        VendeurNom = t.Vendeur != null ? $"{t.Vendeur.Prenom} {t.Vendeur.Nom}" : "",
        AgentId = t.AgentId,
        AgentNom = t.Agent != null ? $"{t.Agent.Prenom} {t.Agent.Nom}" : null,
        DateCreation = t.DateCreation,
        DateFinalisation = t.DateFinalisation
    };
}
