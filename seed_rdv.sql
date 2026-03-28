-- Rendez-vous réalistes (Aix : biens 1-3,20 / Paris : 4-5 / Marseille : 6-7 / Toulouse : 8-9 / Lyon : 10-11 / Nice : 12-13 / Bordeaux : 14-15 / Lille : 16-17 / Strasbourg : 18-19)
-- Statuts : 0=Planifie, 1=Confirme, 2=Annule, 3=Effectue
INSERT INTO "RendezVous" ("DateHeure","Notes","Statut","BienId","ClientId","AgentId") VALUES
-- Forte demande sur Paris (biens 4 et 5)
('2025-09-10 10:00:00+00','Visite matin','3',4,16,4),
('2025-09-12 14:00:00+00','Disponible après-midi','3',4,17,4),
('2025-09-15 11:00:00+00','Très intéressé','1',4,18,4),
('2025-09-18 09:00:00+00','Premier achat','0',5,19,4),
('2025-09-20 16:00:00+00','Visite rapide','3',5,20,4),
('2025-09-22 10:30:00+00','Recherche investissement','1',5,21,4),
('2025-09-25 15:00:00+00','Avec conjoint','0',4,22,4),
-- Bonne demande sur Aix (biens 1, 2, 20)
('2025-09-11 10:00:00+00','Visite complète','3',1,16,3),
('2025-09-14 11:00:00+00','Recherche T3+','1',1,17,3),
('2025-09-16 14:00:00+00','Investissement locatif','3',2,18,3),
('2025-09-19 10:00:00+00','Budget large','0',2,19,3),
('2025-09-21 09:30:00+00','Résidence principale','1',20,20,3),
-- Demande moyenne Marseille (biens 6, 7)
('2025-09-13 10:00:00+00','Villa avec vue','3',6,21,6),
('2025-09-17 14:00:00+00','Centre-ville','1',7,22,6),
('2025-09-24 11:00:00+00','Pour famille','0',6,23,6),
-- Demande moyenne Lyon (biens 10, 11)
('2025-09-12 09:00:00+00','Grand appartement','3',10,17,5),
('2025-09-15 16:00:00+00','Maison familiale','1',11,19,5),
('2025-09-26 10:00:00+00','Avec terrasse','0',10,23,5),
-- Demande faible Nice (bien 12)
('2025-09-14 10:30:00+00','Studio étudiant','3',12,20,9),
('2025-09-28 14:00:00+00','Pied-à-terre','0',13,22,9),
-- Demande faible Toulouse (bien 8)
('2025-09-16 11:00:00+00','Visite maison','3',8,21,7),
-- Demande faible Bordeaux (bien 14)
('2025-09-18 15:00:00+00','Loft intéressant','1',14,16,8),
-- Strasbourg
('2025-09-20 10:00:00+00','Bureau à visiter','0',18,23,11),
-- Lille
('2025-09-22 14:00:00+00','T4 familial','1',16,18,13);
