using System.ComponentModel.DataAnnotations;

namespace YmmoAPI.DTOs;

public class LoginDTO
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string MotDePasse { get; set; } = string.Empty;
}

public class RegisterDTO
{
    [Required, MaxLength(100)]
    public string Nom { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Prenom { get; set; } = string.Empty;

    [Required, EmailAddress, MaxLength(200)]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(8)]
    public string MotDePasse { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Telephone { get; set; }
}

public class AuthResponseDTO
{
    public string Token { get; set; } = string.Empty;
    public UtilisateurDTO Utilisateur { get; set; } = null!;
}

public class UtilisateurDTO
{
    public int Id { get; set; }
    public string Nom { get; set; } = string.Empty;
    public string Prenom { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Telephone { get; set; }
    public string Role { get; set; } = string.Empty;
    public int? AgenceId { get; set; }
    public string? AgenceNom { get; set; }
}

public class UpdateRoleDTO
{
    [Required]
    public string Role { get; set; } = string.Empty;

    public int? AgenceId { get; set; }
}
