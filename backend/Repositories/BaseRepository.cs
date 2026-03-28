using Microsoft.EntityFrameworkCore;
using YmmoAPI.Data;
using YmmoAPI.Interfaces;

namespace YmmoAPI.Repositories;

/// <summary>
/// Implémentation générique du repository — principe DRY (évite la duplication)
/// et principe Single Responsibility (gère uniquement l'accès aux données)
/// </summary>
public abstract class BaseRepository<T> : IRepository<T> where T : class
{
    protected readonly YmmoDbContext _db;
    protected readonly DbSet<T> _dbSet;

    protected BaseRepository(YmmoDbContext db)
    {
        _db = db;
        _dbSet = db.Set<T>();
    }

    public virtual async Task<IEnumerable<T>> GetAllAsync() =>
        await _dbSet.ToListAsync();

    public virtual async Task<T?> GetByIdAsync(int id) =>
        await _dbSet.FindAsync(id);

    public virtual async Task<T> AddAsync(T entity)
    {
        _dbSet.Add(entity);
        await _db.SaveChangesAsync();
        return entity;
    }

    public virtual async Task<T> UpdateAsync(T entity)
    {
        _dbSet.Update(entity);
        await _db.SaveChangesAsync();
        return entity;
    }

    public virtual async Task DeleteAsync(int id)
    {
        var entity = await GetByIdAsync(id);
        if (entity != null)
        {
            _dbSet.Remove(entity);
            await _db.SaveChangesAsync();
        }
    }

    public virtual async Task<bool> ExistsAsync(int id) =>
        await _dbSet.FindAsync(id) != null;
}
