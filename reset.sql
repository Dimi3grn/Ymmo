TRUNCATE "RendezVous", "PhotosBien", "Transactions", "Annonces", "Biens", "Utilisateurs" RESTART IDENTITY CASCADE;

INSERT INTO "Utilisateurs" ("Nom", "Prenom", "Email", "MotDePasseHash", "Role", "DateCreation")
VALUES ('Admin', 'Ymmo', 'admin@ymmo.fr', '$2a$11$uMfSoyG2YYJpSmFrI3PBEuaroF.H9g8r3gZP7qulwdVlO6GIXuHba', 3, NOW());
