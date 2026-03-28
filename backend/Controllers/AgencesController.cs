using Microsoft.AspNetCore.Mvc;
using YmmoAPI.Interfaces;

namespace YmmoAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AgencesController : ControllerBase
{
    private readonly IAgenceRepository _agences;

    public AgencesController(IAgenceRepository agences)
    {
        _agences = agences;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var agences = await _agences.GetAllAsync();
        return Ok(agences.Select(a => new
        {
            a.Id,
            a.Nom,
            a.Adresse,
            a.Ville,
            a.CodePostal,
            a.Telephone,
            a.Email,
            a.EstSiege,
            NbAgents = a.Agents?.Count() ?? 0,
            NbBiens = a.Biens?.Count() ?? 0
        }));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var agence = await _agences.GetWithDetailsAsync(id);
        if (agence is null) return NotFound();

        return Ok(new
        {
            agence.Id,
            agence.Nom,
            agence.Adresse,
            agence.Ville,
            agence.CodePostal,
            agence.Telephone,
            agence.Email,
            agence.EstSiege,
            Agents = agence.Agents.Select(a => new
            {
                a.Id,
                a.Nom,
                a.Prenom,
                a.Email,
                Role = a.Role.ToString()
            }),
            NbBiens = agence.Biens.Count
        });
    }
}
