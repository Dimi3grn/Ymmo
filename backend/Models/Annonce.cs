using System.ComponentModel.DataAnnotations;

namespace YmmoAPI.Models;

public enum TypeAnnonce
{
    Vente,
    Achat
}

public class Annonce
{
    public int Id { get; set; }

    [Required, MaxLength(300)]
    public string Titre { get; set; } = string.Empty;

    [MaxLength(3000)]
    public string? Description { get; set; }

    public TypeAnnonce Type { get; set; }
    public bool EstActive { get; set; } = true;

    public int BienId { get; set; }
    public Bien Bien { get; set; } = null!;

    public int CreateurId { get; set; }
    public Utilisateur Createur { get; set; } = null!;

    public DateTime DateCreation { get; set; } = DateTime.UtcNow;
    public DateTime? DateExpiration { get; set; }
}
