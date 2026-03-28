using YmmoAPI.Models;

namespace YmmoAPI.Interfaces;

public interface IAgenceRepository : IRepository<Agence>
{
    Task<Agence?> GetWithDetailsAsync(int id);
}
