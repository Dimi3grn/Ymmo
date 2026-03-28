using Microsoft.EntityFrameworkCore;
using YmmoAPI.Data;
using YmmoAPI.Interfaces;
using YmmoAPI.Models;

namespace YmmoAPI.Repositories;

/// <summary>
/// Repository spécialisé pour les biens — hérite du comportement générique
/// et ajoute les requêtes métier propres aux biens (principe OCP)
/// </summary>
public class BienRepository : BaseRepository<Bien>, IBienRepository
{
    public BienRepository(YmmoDbContext db) : base(db) { }

    public async Task<(IEnumerable<Bien> Items, int Total)> GetFilteredAsync(BienFiltres filtres)
    {
        var query = _dbSet
            .AsNoTracking()
            .Include(b => b.Agence)
            .Include(b => b.Agent)
            .Include(b => b.Photos)
            .Where(b => b.Statut != StatutBien.Retire)
            .AsQueryable();

        if (!string.IsNullOrEmpty(filtres.Statut) && filtres.Statut != "tous")
        {
            if (Enum.TryParse<StatutBien>(filtres.Statut, true, out var statut))
                query = query.Where(b => b.Statut == statut);
        }

        if (!string.IsNullOrEmpty(filtres.Ville))
            query = query.Where(b => b.Ville.ToLower().Contains(filtres.Ville.ToLower()));

        if (!string.IsNullOrEmpty(filtres.Type) && Enum.TryParse<TypeBien>(filtres.Type, true, out var type))
            query = query.Where(b => b.Type == type);

        if (filtres.PrixMin.HasValue)
            query = query.Where(b => b.Prix >= filtres.PrixMin.Value);

        if (filtres.PrixMax.HasValue)
            query = query.Where(b => b.Prix <= filtres.PrixMax.Value);

        if (filtres.NbPiecesMin.HasValue)
            query = query.Where(b => b.NbPieces >= filtres.NbPiecesMin.Value);

        if (filtres.SurfaceMin.HasValue)
            query = query.Where(b => b.Surface >= filtres.SurfaceMin.Value);

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(b => b.DateCreation)
            .Skip((filtres.Page - 1) * filtres.Taille)
            .Take(filtres.Taille)
            .ToListAsync();

        return (items, total);
    }

    public async Task<Bien?> GetWithDetailsAsync(int id) =>
        await _dbSet
            .AsNoTracking()
            .Include(b => b.Agence)
            .Include(b => b.Agent)
            .Include(b => b.Photos)
            .FirstOrDefaultAsync(b => b.Id == id);
}
