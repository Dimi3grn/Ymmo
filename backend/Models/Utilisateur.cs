using System.ComponentModel.DataAnnotations;

namespace YmmoAPI.Models;

public enum RoleUtilisateur
{
    Client,
    Agent,
    AdminAgence,
    AdminSiege
}

public class Utilisateur
{
    public int Id { get; set; }

    [Required, MaxLength(100)]
    public string Nom { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Prenom { get; set; } = string.Empty;

    [Required, EmailAddress, MaxLength(200)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string MotDePasseHash { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Telephone { get; set; }

    public RoleUtilisateur Role { get; set; } = RoleUtilisateur.Client;

    public int? AgenceId { get; set; }
    public Agence? Agence { get; set; }

    public DateTime DateCreation { get; set; } = DateTime.UtcNow;

    public ICollection<Annonce> Annonces { get; set; } = [];
    public ICollection<Transaction> TransactionsAcheteur { get; set; } = [];
    public ICollection<Transaction> TransactionsVendeur { get; set; } = [];
    public ICollection<RendezVous> RendezVous { get; set; } = [];
}
