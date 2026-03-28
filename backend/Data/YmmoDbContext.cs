using Microsoft.EntityFrameworkCore;
using YmmoAPI.Models;

namespace YmmoAPI.Data;

public class YmmoDbContext : DbContext
{
    public YmmoDbContext(DbContextOptions<YmmoDbContext> options) : base(options) { }

    public DbSet<Utilisateur> Utilisateurs => Set<Utilisateur>();
    public DbSet<Agence> Agences => Set<Agence>();
    public DbSet<Bien> Biens => Set<Bien>();
    public DbSet<PhotoBien> PhotosBien => Set<PhotoBien>();
    public DbSet<Annonce> Annonces => Set<Annonce>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<RendezVous> RendezVous => Set<RendezVous>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Utilisateur>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();

            entity.HasOne(u => u.Agence)
                .WithMany(a => a.Agents)
                .HasForeignKey(u => u.AgenceId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Bien>(entity =>
        {
            entity.HasOne(b => b.Agence)
                .WithMany(a => a.Biens)
                .HasForeignKey(b => b.AgenceId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(b => b.Agent)
                .WithMany()
                .HasForeignKey(b => b.AgentId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Annonce>(entity =>
        {
            entity.HasOne(a => a.Bien)
                .WithMany(b => b.Annonces)
                .HasForeignKey(a => a.BienId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(a => a.Createur)
                .WithMany(u => u.Annonces)
                .HasForeignKey(a => a.CreateurId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.HasOne(t => t.Acheteur)
                .WithMany(u => u.TransactionsAcheteur)
                .HasForeignKey(t => t.AcheteurId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(t => t.Vendeur)
                .WithMany(u => u.TransactionsVendeur)
                .HasForeignKey(t => t.VendeurId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(t => t.Agent)
                .WithMany()
                .HasForeignKey(t => t.AgentId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<RendezVous>(entity =>
        {
            entity.HasOne(r => r.Client)
                .WithMany(u => u.RendezVous)
                .HasForeignKey(r => r.ClientId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(r => r.Agent)
                .WithMany()
                .HasForeignKey(r => r.AgentId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        SeedData(modelBuilder);
    }

    private static void SeedData(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Agence>().HasData(
            new Agence { Id = 1, Nom = "Ymmo Siège - Aix-en-Provence", Adresse = "25 Cours Mirabeau", Ville = "Aix-en-Provence", CodePostal = "13100", EstSiege = true },
            new Agence { Id = 2, Nom = "Ymmo Paris", Adresse = "45 Avenue des Champs-Élysées", Ville = "Paris", CodePostal = "75008" },
            new Agence { Id = 3, Nom = "Ymmo Lyon", Adresse = "12 Place Bellecour", Ville = "Lyon", CodePostal = "69002" },
            new Agence { Id = 4, Nom = "Ymmo Marseille", Adresse = "8 Quai du Port", Ville = "Marseille", CodePostal = "13002" },
            new Agence { Id = 5, Nom = "Ymmo Toulouse", Adresse = "3 Place du Capitole", Ville = "Toulouse", CodePostal = "31000" },
            new Agence { Id = 6, Nom = "Ymmo Bordeaux", Adresse = "15 Place de la Bourse", Ville = "Bordeaux", CodePostal = "33000" },
            new Agence { Id = 7, Nom = "Ymmo Nice", Adresse = "20 Promenade des Anglais", Ville = "Nice", CodePostal = "06000" },
            new Agence { Id = 8, Nom = "Ymmo Nantes", Adresse = "5 Place Royale", Ville = "Nantes", CodePostal = "44000" },
            new Agence { Id = 9, Nom = "Ymmo Strasbourg", Adresse = "10 Place Kléber", Ville = "Strasbourg", CodePostal = "67000" },
            new Agence { Id = 10, Nom = "Ymmo Montpellier", Adresse = "7 Place de la Comédie", Ville = "Montpellier", CodePostal = "34000" },
            new Agence { Id = 11, Nom = "Ymmo Lille", Adresse = "22 Grand Place", Ville = "Lille", CodePostal = "59000" },
            new Agence { Id = 12, Nom = "Ymmo Rennes", Adresse = "18 Place de la Mairie", Ville = "Rennes", CodePostal = "35000" },
            new Agence { Id = 13, Nom = "Ymmo Grenoble", Adresse = "4 Place Victor Hugo", Ville = "Grenoble", CodePostal = "38000" }
        );

        modelBuilder.Entity<Utilisateur>().HasData(
            new Utilisateur
            {
                Id = 1,
                Nom = "Admin",
                Prenom = "Ymmo",
                Email = "admin@ymmo.fr",
                MotDePasseHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                Role = RoleUtilisateur.AdminSiege,
                AgenceId = 1,
                DateCreation = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );
    }
}
