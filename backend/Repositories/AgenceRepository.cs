using Microsoft.EntityFrameworkCore;
using YmmoAPI.Data;
using YmmoAPI.Interfaces;
using YmmoAPI.Models;

namespace YmmoAPI.Repositories;

public class AgenceRepository : BaseRepository<Agence>, IAgenceRepository
{
    public AgenceRepository(YmmoDbContext db) : base(db) { }

    public override async Task<IEnumerable<Agence>> GetAllAsync() =>
        await _dbSet
            .Include(a => a.Agents)
            .Include(a => a.Biens)
            .OrderBy(a => a.Nom)
            .ToListAsync();

    public async Task<Agence?> GetWithDetailsAsync(int id) =>
        await _dbSet
            .Include(a => a.Agents)
            .Include(a => a.Biens)
            .FirstOrDefaultAsync(a => a.Id == id);
}
