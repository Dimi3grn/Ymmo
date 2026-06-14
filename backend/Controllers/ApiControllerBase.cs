using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

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

    /// <summary>Agence de rattachement de l'utilisateur, ou null (cas d'un Client).</summary>
    protected int? CurrentUserAgenceId =>
        int.TryParse(User.FindFirstValue("agenceId"), out var id) ? id : null;
}
