using System.ComponentModel.DataAnnotations;

namespace YmmoAPI.Models;

public enum StatutRendezVous
{
    Planifie,
    Confirme,
    Annule,
    Effectue
}

public class RendezVous
{
    public int Id { get; set; }

    public DateTime DateHeure { get; set; }

    [MaxLength(1000)]
    public string? Notes { get; set; }

    public StatutRendezVous Statut { get; set; } = StatutRendezVous.Planifie;

    public int BienId { get; set; }
    public Bien Bien { get; set; } = null!;

    public int ClientId { get; set; }
    public Utilisateur Client { get; set; } = null!;

    public int AgentId { get; set; }
    public Utilisateur Agent { get; set; } = null!;
}
