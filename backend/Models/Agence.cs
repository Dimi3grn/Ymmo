using System.ComponentModel.DataAnnotations;

namespace YmmoAPI.Models;

public class Agence
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Nom { get; set; } = string.Empty;

    [Required, MaxLength(300)]
    public string Adresse { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Ville { get; set; } = string.Empty;

    [Required, MaxLength(10)]
    public string CodePostal { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Telephone { get; set; }

    [EmailAddress, MaxLength(200)]
    public string? Email { get; set; }

    public bool EstSiege { get; set; } = false;

    public ICollection<Utilisateur> Agents { get; set; } = [];
    public ICollection<Bien> Biens { get; set; } = [];
}
