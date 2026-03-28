using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace YmmoAPI.Models;

public enum StatutTransaction
{
    EnCours,
    SousCompromis,
    Finalisee,
    Annulee
}

public class Transaction
{
    public int Id { get; set; }

    [Column(TypeName = "decimal(12,2)")]
    public decimal MontantFinal { get; set; }

    public StatutTransaction Statut { get; set; } = StatutTransaction.EnCours;

    public int BienId { get; set; }
    public Bien Bien { get; set; } = null!;

    public int AcheteurId { get; set; }
    public Utilisateur Acheteur { get; set; } = null!;

    public int VendeurId { get; set; }
    public Utilisateur Vendeur { get; set; } = null!;

    public int? AgentId { get; set; }
    public Utilisateur? Agent { get; set; }

    public DateTime DateCreation { get; set; } = DateTime.UtcNow;
    public DateTime? DateFinalisation { get; set; }
}
