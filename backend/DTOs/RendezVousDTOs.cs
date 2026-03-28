using System.ComponentModel.DataAnnotations;

namespace YmmoAPI.DTOs;

public class RendezVousDTO
{
    public int Id { get; set; }
    public DateTime DateHeure { get; set; }
    public string? Notes { get; set; }
    public string Statut { get; set; } = string.Empty;
    public int BienId { get; set; }
    public string BienTitre { get; set; } = string.Empty;
    public string BienVille { get; set; } = string.Empty;
    public int ClientId { get; set; }
    public string ClientNom { get; set; } = string.Empty;
    public string ClientEmail { get; set; } = string.Empty;
    public string? ClientTelephone { get; set; }
    public int AgentId { get; set; }
    public string AgentNom { get; set; } = string.Empty;
}

public class CreateRendezVousDTO
{
    [Required]
    public DateTime DateHeure { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }

    [Required]
    public int BienId { get; set; }
}

public class TransactionDTO
{
    public int Id { get; set; }
    public decimal MontantFinal { get; set; }
    public string Statut { get; set; } = string.Empty;
    public int BienId { get; set; }
    public string BienTitre { get; set; } = string.Empty;
    public string BienVille { get; set; } = string.Empty;
    public decimal BienPrix { get; set; }
    public int AcheteurId { get; set; }
    public string AcheteurNom { get; set; } = string.Empty;
    public int VendeurId { get; set; }
    public string VendeurNom { get; set; } = string.Empty;
    public int? AgentId { get; set; }
    public string? AgentNom { get; set; }
    public DateTime DateCreation { get; set; }
    public DateTime? DateFinalisation { get; set; }
}

public class CreateTransactionDTO
{
    [Required]
    public int BienId { get; set; }

    [Required]
    public int AcheteurId { get; set; }

    [Required]
    public int VendeurId { get; set; }

    [Range(0, double.MaxValue)]
    public decimal MontantFinal { get; set; }
}

public class UpdateTransactionStatutDTO
{
    [Required]
    public string Statut { get; set; } = string.Empty;
}

public class ClientOfferDTO
{
    [Required]
    public int RendezVousId { get; set; }

    [Required, Range(1, double.MaxValue)]
    public decimal Montant { get; set; }
}
