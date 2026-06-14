using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using YmmoAPI.Data;

namespace YmmoAPI.Controllers;

/// <summary>
/// Base commune aux controllers — centralise la lecture des claims du JWT.
/// Principe DRY : évite de redéfinir GetUserId/GetUserRole dans chaque controller.
/// </summary>
public abstract class ApiControllerBase : ControllerBase
{
    /// <summary>Identifiant de l'utilisateur authentifié (claim NameIdentifier).</summary>
    protected int CurrentUserId =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new InvalidOperationException("Claim d'identité utilisateur manquant."));

    /// <summary>Rôle de l'utilisateur authentifié (Client, Agent, AdminAgence, AdminSiege).</summary>
    protected string CurrentUserRole =>
        User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;

    /// <summary>Agence de rattachement issue du claim JWT, ou null si absent.</summary>
    protected int? CurrentUserAgenceId =>
        int.TryParse(User.FindFirstValue("agenceId"), out var id) ? id : null;

    /// <summary>
    /// Résout l'agence de l'utilisateur en privilégiant le claim JWT, avec repli
    /// sur la base si le claim est absent (cas d'un token émis avant l'ajout du
    /// claim agenceId). Évite de confondre « claim manquant » et « aucune agence »,
    /// ce qui priverait un AdminAgence d'accès jusqu'à expiration de son token.
    /// </summary>
    protected async Task<int?> ResolveCurrentUserAgenceIdAsync(YmmoDbContext db)
    {
        if (CurrentUserAgenceId is int fromClaim)
            return fromClaim;

        return await db.Utilisateurs
            .Where(u => u.Id == CurrentUserId)
            .Select(u => u.AgenceId)
            .FirstOrDefaultAsync();
    }
}
