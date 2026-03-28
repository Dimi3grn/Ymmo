using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using YmmoAPI.DTOs;
using YmmoAPI.Interfaces;
using YmmoAPI.Models;

namespace YmmoAPI.Controllers;

/// <summary>
/// Controller Biens — ne dépend que des interfaces (principe Dependency Inversion)
/// Délègue toute logique de données au repository (principe Single Responsibility)
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class BiensController : ControllerBase
{
    private readonly IBienRepository _biens;

    public BiensController(IBienRepository biens)
    {
        _biens = biens;
    }

    [HttpGet]
    public async Task<ActionResult<List<BienDTO>>> GetAll(
        [FromQuery] string? ville,
        [FromQuery] string? type,
        [FromQuery] string? statut,
        [FromQuery] decimal? prixMin,
        [FromQuery] decimal? prixMax,
        [FromQuery] int? nbPiecesMin,
        [FromQuery] double? surfaceMin,
        [FromQuery] int page = 1,
        [FromQuery] int taille = 20)
    {
        var filtres = new BienFiltres
        {
            Ville = ville,
            Type = type,
            Statut = statut,
            PrixMin = prixMin,
            PrixMax = prixMax,
            NbPiecesMin = nbPiecesMin,
            SurfaceMin = surfaceMin,
            Page = page,
            Taille = taille
        };

        var (items, total) = await _biens.GetFilteredAsync(filtres);
        Response.Headers.Append("X-Total-Count", total.ToString());

        return Ok(items.Select(MapToDTO));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BienDTO>> GetById(int id)
    {
        var bien = await _biens.GetWithDetailsAsync(id);
        return bien is null ? NotFound() : Ok(MapToDTO(bien));
    }

    [Authorize(Roles = "Agent,AdminAgence,AdminSiege")]
    [HttpPost]
    public async Task<ActionResult<BienDTO>> Create(CreateBienDTO dto)
    {
        if (!Enum.TryParse<TypeBien>(dto.Type, true, out var typeBien))
            return BadRequest(new { message = "Type de bien invalide." });

        var bien = new Bien
        {
            Titre = dto.Titre,
            Description = dto.Description,
            Type = typeBien,
            Prix = dto.Prix,
            Surface = dto.Surface,
            NbPieces = dto.NbPieces,
            NbChambres = dto.NbChambres,
            Adresse = dto.Adresse,
            Ville = dto.Ville,
            CodePostal = dto.CodePostal,
            Latitude = dto.Latitude,
            Longitude = dto.Longitude,
            AnneeConstruction = dto.AnneeConstruction,
            DPE = dto.DPE,
            Ascenseur = dto.Ascenseur,
            Parking = dto.Parking,
            Balcon = dto.Balcon,
            Jardin = dto.Jardin,
            Piscine = dto.Piscine,
            AgenceId = dto.AgenceId
        };

        await _biens.AddAsync(bien);
        var created = await _biens.GetWithDetailsAsync(bien.Id);

        return CreatedAtAction(nameof(GetById), new { id = bien.Id }, MapToDTO(created!));
    }

    [Authorize(Roles = "Agent,AdminAgence,AdminSiege")]
    [HttpPut("{id}")]
    public async Task<ActionResult<BienDTO>> Update(int id, CreateBienDTO dto)
    {
        var bien = await _biens.GetByIdAsync(id);
        if (bien is null) return NotFound();

        if (!Enum.TryParse<TypeBien>(dto.Type, true, out var typeBien))
            return BadRequest(new { message = "Type de bien invalide." });

        bien.Titre = dto.Titre;
        bien.Description = dto.Description;
        bien.Type = typeBien;
        bien.Prix = dto.Prix;
        bien.Surface = dto.Surface;
        bien.NbPieces = dto.NbPieces;
        bien.NbChambres = dto.NbChambres;
        bien.Adresse = dto.Adresse;
        bien.Ville = dto.Ville;
        bien.CodePostal = dto.CodePostal;
        bien.Latitude = dto.Latitude;
        bien.Longitude = dto.Longitude;
        bien.AnneeConstruction = dto.AnneeConstruction;
        bien.DPE = dto.DPE;
        bien.Ascenseur = dto.Ascenseur;
        bien.Parking = dto.Parking;
        bien.Balcon = dto.Balcon;
        bien.Jardin = dto.Jardin;
        bien.Piscine = dto.Piscine;
        bien.DateModification = DateTime.UtcNow;

        await _biens.UpdateAsync(bien);
        var updated = await _biens.GetWithDetailsAsync(id);

        return Ok(MapToDTO(updated!));
    }

    [Authorize(Roles = "AdminAgence,AdminSiege")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        if (!await _biens.ExistsAsync(id)) return NotFound();
        await _biens.DeleteAsync(id);
        return NoContent();
    }

    private static BienDTO MapToDTO(Bien b) => new()
    {
        Id = b.Id,
        Titre = b.Titre,
        Description = b.Description,
        Type = b.Type.ToString(),
        Statut = b.Statut.ToString(),
        Prix = b.Prix,
        Surface = b.Surface,
        NbPieces = b.NbPieces,
        NbChambres = b.NbChambres,
        Adresse = b.Adresse,
        Ville = b.Ville,
        CodePostal = b.CodePostal,
        Latitude = b.Latitude,
        Longitude = b.Longitude,
        AnneeConstruction = b.AnneeConstruction,
        DPE = b.DPE,
        Ascenseur = b.Ascenseur,
        Parking = b.Parking,
        Balcon = b.Balcon,
        Jardin = b.Jardin,
        Piscine = b.Piscine,
        AgenceNom = b.Agence?.Nom ?? "",
        AgentNom = b.Agent != null ? $"{b.Agent.Prenom} {b.Agent.Nom}" : null,
        DateCreation = b.DateCreation,
        Photos = b.Photos.Select(p => new PhotoDTO { Id = p.Id, Url = p.Url, EstPrincipale = p.EstPrincipale }).ToList()
    };
}
