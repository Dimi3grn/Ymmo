using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YmmoAPI.Models;

public enum TypeBien
{
    Appartement,
    Maison,
    Terrain,
    Local,
    Bureau
}

public enum StatutBien
{
    Disponible,
    SousCompromis,
    Vendu,
    Retire
}

public class Bien
{
    public int Id { get; set; }

    [Required, MaxLength(300)]
    public string Titre { get; set; } = string.Empty;

    [MaxLength(3000)]
    public string? Description { get; set; }

    public TypeBien Type { get; set; }
    public StatutBien Statut { get; set; } = StatutBien.Disponible;

    [Column(TypeName = "decimal(12,2)")]
    public decimal Prix { get; set; }

    public double Surface { get; set; }
    public int NbPieces { get; set; }
    public int NbChambres { get; set; }

    [Required, MaxLength(300)]
    public string Adresse { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Ville { get; set; } = string.Empty;

    [Required, MaxLength(10)]
    public string CodePostal { get; set; } = string.Empty;

    public double? Latitude { get; set; }
    public double? Longitude { get; set; }

    public int? AnneeConstruction { get; set; }

    [MaxLength(5)]
    public string? DPE { get; set; }

    public bool Ascenseur { get; set; }
    public bool Parking { get; set; }
    public bool Balcon { get; set; }
    public bool Jardin { get; set; }
    public bool Piscine { get; set; }

    public int AgenceId { get; set; }
    public Agence Agence { get; set; } = null!;

    public int? AgentId { get; set; }
    public Utilisateur? Agent { get; set; }

    public DateTime DateCreation { get; set; } = DateTime.UtcNow;
    public DateTime DateModification { get; set; } = DateTime.UtcNow;

    public ICollection<PhotoBien> Photos { get; set; } = [];
    public ICollection<Annonce> Annonces { get; set; } = [];
}
