-- Photos des biens : chemins LOCAUX servis par le frontend (vite/nginx) depuis
-- frontend/public/images/biens/. Les anciennes URLs Unsplash externes expiraient
-- (erreurs 404) ; ces fichiers sont versionnés dans le dépôt et toujours disponibles.
--
-- Le DELETE rend le script idempotent : on peut le rejouer après le seed initial
-- pour remplacer les anciennes URLs Unsplash sans dupliquer les lignes (sinon les
-- INSERT créeraient des doublons, dont plusieurs EstPrincipale = true par bien).
DELETE FROM "PhotosBien";
INSERT INTO "PhotosBien" ("Url", "EstPrincipale", "BienId") VALUES
-- Bien 1 : Appartement lumineux Aix
('/images/biens/appartement-1.jpg', true, 1),
('/images/biens/interieur-1.jpg', false, 1),
('/images/biens/interieur-2.jpg', false, 1),
-- Bien 2 : Maison avec piscine Aix
('/images/biens/maison-1.jpg', true, 2),
('/images/biens/villa-1.jpg', false, 2),
('/images/biens/interieur-3.jpg', false, 2),
-- Bien 3 : Studio rénové Aix
('/images/biens/studio-1.jpg', true, 3),
('/images/biens/interieur-4.jpg', false, 3),
-- Bien 4 : Haussmannien Paris
('/images/biens/appartement-2.jpg', true, 4),
('/images/biens/interieur-1.jpg', false, 4),
('/images/biens/interieur-2.jpg', false, 4),
-- Bien 5 : Loft Bastille
('/images/biens/loft-1.jpg', true, 5),
('/images/biens/interieur-3.jpg', false, 5),
-- Bien 6 : Villa prestige Marseille
('/images/biens/villa-1.jpg', true, 6),
('/images/biens/villa-2.jpg', false, 6),
('/images/biens/interieur-4.jpg', false, 6),
-- Bien 7 : T3 Vieux-Port
('/images/biens/appartement-3.jpg', true, 7),
('/images/biens/interieur-1.jpg', false, 7),
-- Bien 8 : Maison Toulouse
('/images/biens/maison-2.jpg', true, 8),
('/images/biens/interieur-2.jpg', false, 8),
-- Bien 9 : T2 Toulouse
('/images/biens/appartement-4.jpg', true, 9),
('/images/biens/interieur-3.jpg', false, 9),
-- Bien 10 : 5 pièces Lyon
('/images/biens/appartement-1.jpg', true, 10),
('/images/biens/interieur-4.jpg', false, 10),
('/images/biens/interieur-5.jpg', false, 10),
-- Bien 11 : Maison Lyon
('/images/biens/maison-3.jpg', true, 11),
('/images/biens/interieur-2.jpg', false, 11),
-- Bien 12 : Studio Nice
('/images/biens/studio-2.jpg', true, 12),
('/images/biens/interieur-3.jpg', false, 12),
-- Bien 13 : Villa Nice
('/images/biens/villa-2.jpg', true, 13),
('/images/biens/villa-1.jpg', false, 13),
('/images/biens/interieur-4.jpg', false, 13),
-- Bien 14 : Loft Bordeaux
('/images/biens/loft-2.jpg', true, 14),
('/images/biens/interieur-1.jpg', false, 14),
-- Bien 15 : Terrain Bordeaux
('/images/biens/terrain-1.jpg', true, 15),
-- Bien 16 : T4 Lille
('/images/biens/appartement-2.jpg', true, 16),
('/images/biens/interieur-5.jpg', false, 16),
-- Bien 17 : Maison bourgeoise Lille
('/images/biens/maison-1.jpg', true, 17),
('/images/biens/interieur-3.jpg', false, 17),
-- Bien 18 : Bureau Strasbourg
('/images/biens/bureau-1.jpg', true, 18),
-- Bien 19 : T3 neuf Strasbourg
('/images/biens/appartement-3.jpg', true, 19),
('/images/biens/interieur-4.jpg', false, 19),
-- Bien 20 : Mas provençal Aix
('/images/biens/maison-3.jpg', true, 20),
('/images/biens/villa-2.jpg', false, 20),
('/images/biens/interieur-1.jpg', false, 20);
