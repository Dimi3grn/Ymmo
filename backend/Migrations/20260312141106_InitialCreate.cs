using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace YmmoAPI.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Agences",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nom = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Adresse = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Ville = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CodePostal = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    Telephone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    EstSiege = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Agences", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Utilisateurs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nom = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Prenom = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    MotDePasseHash = table.Column<string>(type: "text", nullable: false),
                    Telephone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    Role = table.Column<int>(type: "integer", nullable: false),
                    AgenceId = table.Column<int>(type: "integer", nullable: true),
                    DateCreation = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Utilisateurs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Utilisateurs_Agences_AgenceId",
                        column: x => x.AgenceId,
                        principalTable: "Agences",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Biens",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Titre = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Description = table.Column<string>(type: "character varying(3000)", maxLength: 3000, nullable: true),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Statut = table.Column<int>(type: "integer", nullable: false),
                    Prix = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    Surface = table.Column<double>(type: "double precision", nullable: false),
                    NbPieces = table.Column<int>(type: "integer", nullable: false),
                    NbChambres = table.Column<int>(type: "integer", nullable: false),
                    Adresse = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Ville = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CodePostal = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    Latitude = table.Column<double>(type: "double precision", nullable: true),
                    Longitude = table.Column<double>(type: "double precision", nullable: true),
                    AnneeConstruction = table.Column<int>(type: "integer", nullable: true),
                    DPE = table.Column<string>(type: "character varying(5)", maxLength: 5, nullable: true),
                    Ascenseur = table.Column<bool>(type: "boolean", nullable: false),
                    Parking = table.Column<bool>(type: "boolean", nullable: false),
                    Balcon = table.Column<bool>(type: "boolean", nullable: false),
                    Jardin = table.Column<bool>(type: "boolean", nullable: false),
                    Piscine = table.Column<bool>(type: "boolean", nullable: false),
                    AgenceId = table.Column<int>(type: "integer", nullable: false),
                    AgentId = table.Column<int>(type: "integer", nullable: true),
                    DateCreation = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DateModification = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Biens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Biens_Agences_AgenceId",
                        column: x => x.AgenceId,
                        principalTable: "Agences",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Biens_Utilisateurs_AgentId",
                        column: x => x.AgentId,
                        principalTable: "Utilisateurs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Annonces",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Titre = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Description = table.Column<string>(type: "character varying(3000)", maxLength: 3000, nullable: true),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    EstActive = table.Column<bool>(type: "boolean", nullable: false),
                    BienId = table.Column<int>(type: "integer", nullable: false),
                    CreateurId = table.Column<int>(type: "integer", nullable: false),
                    DateCreation = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DateExpiration = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Annonces", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Annonces_Biens_BienId",
                        column: x => x.BienId,
                        principalTable: "Biens",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Annonces_Utilisateurs_CreateurId",
                        column: x => x.CreateurId,
                        principalTable: "Utilisateurs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PhotosBien",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    EstPrincipale = table.Column<bool>(type: "boolean", nullable: false),
                    BienId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PhotosBien", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PhotosBien_Biens_BienId",
                        column: x => x.BienId,
                        principalTable: "Biens",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RendezVous",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    DateHeure = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Statut = table.Column<int>(type: "integer", nullable: false),
                    BienId = table.Column<int>(type: "integer", nullable: false),
                    ClientId = table.Column<int>(type: "integer", nullable: false),
                    AgentId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RendezVous", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RendezVous_Biens_BienId",
                        column: x => x.BienId,
                        principalTable: "Biens",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_RendezVous_Utilisateurs_AgentId",
                        column: x => x.AgentId,
                        principalTable: "Utilisateurs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RendezVous_Utilisateurs_ClientId",
                        column: x => x.ClientId,
                        principalTable: "Utilisateurs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Transactions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MontantFinal = table.Column<decimal>(type: "numeric(12,2)", nullable: false),
                    Statut = table.Column<int>(type: "integer", nullable: false),
                    BienId = table.Column<int>(type: "integer", nullable: false),
                    AcheteurId = table.Column<int>(type: "integer", nullable: false),
                    VendeurId = table.Column<int>(type: "integer", nullable: false),
                    AgentId = table.Column<int>(type: "integer", nullable: true),
                    DateCreation = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    DateFinalisation = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Transactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Transactions_Biens_BienId",
                        column: x => x.BienId,
                        principalTable: "Biens",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Transactions_Utilisateurs_AcheteurId",
                        column: x => x.AcheteurId,
                        principalTable: "Utilisateurs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Transactions_Utilisateurs_AgentId",
                        column: x => x.AgentId,
                        principalTable: "Utilisateurs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Transactions_Utilisateurs_VendeurId",
                        column: x => x.VendeurId,
                        principalTable: "Utilisateurs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "Agences",
                columns: new[] { "Id", "Adresse", "CodePostal", "Email", "EstSiege", "Nom", "Telephone", "Ville" },
                values: new object[,]
                {
                    { 1, "25 Cours Mirabeau", "13100", null, true, "Ymmo Siège - Aix-en-Provence", null, "Aix-en-Provence" },
                    { 2, "45 Avenue des Champs-Élysées", "75008", null, false, "Ymmo Paris", null, "Paris" },
                    { 3, "12 Place Bellecour", "69002", null, false, "Ymmo Lyon", null, "Lyon" },
                    { 4, "8 Quai du Port", "13002", null, false, "Ymmo Marseille", null, "Marseille" },
                    { 5, "3 Place du Capitole", "31000", null, false, "Ymmo Toulouse", null, "Toulouse" },
                    { 6, "15 Place de la Bourse", "33000", null, false, "Ymmo Bordeaux", null, "Bordeaux" },
                    { 7, "20 Promenade des Anglais", "06000", null, false, "Ymmo Nice", null, "Nice" },
                    { 8, "5 Place Royale", "44000", null, false, "Ymmo Nantes", null, "Nantes" },
                    { 9, "10 Place Kléber", "67000", null, false, "Ymmo Strasbourg", null, "Strasbourg" },
                    { 10, "7 Place de la Comédie", "34000", null, false, "Ymmo Montpellier", null, "Montpellier" },
                    { 11, "22 Grand Place", "59000", null, false, "Ymmo Lille", null, "Lille" },
                    { 12, "18 Place de la Mairie", "35000", null, false, "Ymmo Rennes", null, "Rennes" },
                    { 13, "4 Place Victor Hugo", "38000", null, false, "Ymmo Grenoble", null, "Grenoble" }
                });

            migrationBuilder.InsertData(
                table: "Utilisateurs",
                columns: new[] { "Id", "AgenceId", "DateCreation", "Email", "MotDePasseHash", "Nom", "Prenom", "Role", "Telephone" },
                values: new object[] { 1, 1, new DateTime(2025, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "admin@ymmo.fr", "$2a$11$3aupF6LGPRaualWaA/UAiuSB/EmDkUou1xuhCTzEMMp0w4mKY.f5u", "Admin", "Ymmo", 3, null });

            migrationBuilder.CreateIndex(
                name: "IX_Annonces_BienId",
                table: "Annonces",
                column: "BienId");

            migrationBuilder.CreateIndex(
                name: "IX_Annonces_CreateurId",
                table: "Annonces",
                column: "CreateurId");

            migrationBuilder.CreateIndex(
                name: "IX_Biens_AgenceId",
                table: "Biens",
                column: "AgenceId");

            migrationBuilder.CreateIndex(
                name: "IX_Biens_AgentId",
                table: "Biens",
                column: "AgentId");

            migrationBuilder.CreateIndex(
                name: "IX_PhotosBien_BienId",
                table: "PhotosBien",
                column: "BienId");

            migrationBuilder.CreateIndex(
                name: "IX_RendezVous_AgentId",
                table: "RendezVous",
                column: "AgentId");

            migrationBuilder.CreateIndex(
                name: "IX_RendezVous_BienId",
                table: "RendezVous",
                column: "BienId");

            migrationBuilder.CreateIndex(
                name: "IX_RendezVous_ClientId",
                table: "RendezVous",
                column: "ClientId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_AcheteurId",
                table: "Transactions",
                column: "AcheteurId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_AgentId",
                table: "Transactions",
                column: "AgentId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_BienId",
                table: "Transactions",
                column: "BienId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_VendeurId",
                table: "Transactions",
                column: "VendeurId");

            migrationBuilder.CreateIndex(
                name: "IX_Utilisateurs_AgenceId",
                table: "Utilisateurs",
                column: "AgenceId");

            migrationBuilder.CreateIndex(
                name: "IX_Utilisateurs_Email",
                table: "Utilisateurs",
                column: "Email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Annonces");

            migrationBuilder.DropTable(
                name: "PhotosBien");

            migrationBuilder.DropTable(
                name: "RendezVous");

            migrationBuilder.DropTable(
                name: "Transactions");

            migrationBuilder.DropTable(
                name: "Biens");

            migrationBuilder.DropTable(
                name: "Utilisateurs");

            migrationBuilder.DropTable(
                name: "Agences");
        }
    }
}
