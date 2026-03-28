using YmmoAPI.Models;

namespace YmmoAPI.Interfaces;

public class BienFiltres
{
    public string? Ville { get; set; }
    public string? Type { get; set; }
    public string? Statut { get; set; }
    public decimal? PrixMin { get; set; }
    public decimal? PrixMax { get; set; }
    public int? NbPiecesMin { get; set; }
    public double? SurfaceMin { get; set; }
    public int Page { get; set; } = 1;
    public int Taille { get; set; } = 20;
}

/// <summary>
/// Spécialisation du repository pour les biens — principe Open/Closed (SOLID-O)
/// </summary>
public interface IBienRepository : IRepository<Bien>
{
    Task<(IEnumerable<Bien> Items, int Total)> GetFilteredAsync(BienFiltres filtres);
    Task<Bien?> GetWithDetailsAsync(int id);
}
