using System.ComponentModel.DataAnnotations;

namespace YmmoAPI.DTOs;

public class BienDTO
{
    public int Id { get; set; }
    public string Titre { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Statut { get; set; } = string.Empty;
    public decimal Prix { get; set; }
    public double Surface { get; set; }
    public int NbPieces { get; set; }
    public int NbChambres { get; set; }
    public string Adresse { get; set; } = string.Empty;
    public string Ville { get; set; } = string.Empty;
    public string CodePostal { get; set; } = string.Empty;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public int? AnneeConstruction { get; set; }
    public string? DPE { get; set; }
    public bool Ascenseur { get; set; }
    public bool Parking { get; set; }
    public bool Balcon { get; set; }
    public bool Jardin { get; set; }
    public bool Piscine { get; set; }
    public string AgenceNom { get; set; } = string.Empty;
    public string? AgentNom { get; set; }
    public DateTime DateCreation { get; set; }
    public List<PhotoDTO> Photos { get; set; } = [];
}

public class CreateBienDTO
{
    [Required, MaxLength(300)]
    public string Titre { get; set; } = string.Empty;

    [MaxLength(3000)]
    public string? Description { get; set; }

    [Required]
    public string Type { get; set; } = string.Empty;

    [Range(0, double.MaxValue)]
    public decimal Prix { get; set; }

    [Range(1, 100000)]
    public double Surface { get; set; }

    [Range(1, 100)]
    public int NbPieces { get; set; }

    [Range(0, 100)]
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
    public string? DPE { get; set; }
    public bool Ascenseur { get; set; }
    public bool Parking { get; set; }
    public bool Balcon { get; set; }
    public bool Jardin { get; set; }
    public bool Piscine { get; set; }
    public int AgenceId { get; set; }
}

public class PhotoDTO
{
    public int Id { get; set; }
    public string Url { get; set; } = string.Empty;
    public bool EstPrincipale { get; set; }
}
