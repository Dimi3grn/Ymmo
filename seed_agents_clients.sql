-- Agents : 1 par agence (mot de passe: Agent123!)
-- Le hash BCrypt ci-dessous correspond à "Agent123!"
-- BCrypt hash pour Agent123! généré avec cost 11

INSERT INTO "Utilisateurs" ("Nom","Prenom","Email","MotDePasseHash","Telephone","Role","AgenceId","DateCreation") VALUES
('Dupont','Marie','m.dupont@ymmo.fr','$2b$11$GuAgXkPf5qQDGQat92bS3uJpdopFa7RBZAvqdThtdvZUR3h4cCF8m','0612345601',1,1,'2025-02-01 00:00:00+00'),
('Martin','Lucas','l.martin@ymmo.fr','$2b$11$GuAgXkPf5qQDGQat92bS3uJpdopFa7RBZAvqdThtdvZUR3h4cCF8m','0612345602',1,2,'2025-02-01 00:00:00+00'),
('Bernard','Sophie','s.bernard@ymmo.fr','$2b$11$GuAgXkPf5qQDGQat92bS3uJpdopFa7RBZAvqdThtdvZUR3h4cCF8m','0612345603',1,3,'2025-02-01 00:00:00+00'),
('Petit','Thomas','t.petit@ymmo.fr','$2b$11$GuAgXkPf5qQDGQat92bS3uJpdopFa7RBZAvqdThtdvZUR3h4cCF8m','0612345604',1,4,'2025-02-01 00:00:00+00'),
('Robert','Julie','j.robert@ymmo.fr','$2b$11$GuAgXkPf5qQDGQat92bS3uJpdopFa7RBZAvqdThtdvZUR3h4cCF8m','0612345605',1,5,'2025-02-01 00:00:00+00'),
('Durand','Antoine','a.durand@ymmo.fr','$2b$11$GuAgXkPf5qQDGQat92bS3uJpdopFa7RBZAvqdThtdvZUR3h4cCF8m','0612345606',1,6,'2025-02-01 00:00:00+00'),
('Leroy','Camille','c.leroy@ymmo.fr','$2b$11$GuAgXkPf5qQDGQat92bS3uJpdopFa7RBZAvqdThtdvZUR3h4cCF8m','0612345607',1,7,'2025-02-01 00:00:00+00'),
('Moreau','Nicolas','n.moreau@ymmo.fr','$2b$11$GuAgXkPf5qQDGQat92bS3uJpdopFa7RBZAvqdThtdvZUR3h4cCF8m','0612345608',1,8,'2025-02-01 00:00:00+00'),
('Fournier','Emma','e.fournier@ymmo.fr','$2b$11$GuAgXkPf5qQDGQat92bS3uJpdopFa7RBZAvqdThtdvZUR3h4cCF8m','0612345609',1,9,'2025-02-01 00:00:00+00'),
('Girard','Paul','p.girard@ymmo.fr','$2b$11$GuAgXkPf5qQDGQat92bS3uJpdopFa7RBZAvqdThtdvZUR3h4cCF8m','0612345610',1,10,'2025-02-01 00:00:00+00'),
('Bonnet','Léa','l.bonnet@ymmo.fr','$2b$11$GuAgXkPf5qQDGQat92bS3uJpdopFa7RBZAvqdThtdvZUR3h4cCF8m','0612345611',1,11,'2025-02-01 00:00:00+00'),
('Rousseau','Hugo','h.rousseau@ymmo.fr','$2b$11$GuAgXkPf5qQDGQat92bS3uJpdopFa7RBZAvqdThtdvZUR3h4cCF8m','0612345612',1,12,'2025-02-01 00:00:00+00'),
('Blanc','Clara','c.blanc@ymmo.fr','$2b$11$GuAgXkPf5qQDGQat92bS3uJpdopFa7RBZAvqdThtdvZUR3h4cCF8m','0612345613',1,13,'2025-02-01 00:00:00+00');

-- Clients fictifs
INSERT INTO "Utilisateurs" ("Nom","Prenom","Email","MotDePasseHash","Telephone","Role","AgenceId","DateCreation") VALUES
('Lemaire','Pierre','p.lemaire@gmail.com','$2b$11$GuAgXkPf5qQDGQat92bS3uJpdopFa7RBZAvqdThtdvZUR3h4cCF8m','0698001122',0,NULL,'2025-03-10 00:00:00+00'),
('Noël','Charlotte','c.noel@gmail.com','$2b$11$GuAgXkPf5qQDGQat92bS3uJpdopFa7RBZAvqdThtdvZUR3h4cCF8m','0698003344',0,NULL,'2025-04-05 00:00:00+00'),
('Mercier','Julien','j.mercier@outlook.com','$2b$11$GuAgXkPf5qQDGQat92bS3uJpdopFa7RBZAvqdThtdvZUR3h4cCF8m','0698005566',0,NULL,'2025-04-22 00:00:00+00'),
('Simon','Manon','m.simon@hotmail.com','$2b$11$GuAgXkPf5qQDGQat92bS3uJpdopFa7RBZAvqdThtdvZUR3h4cCF8m','0698007788',0,NULL,'2025-05-15 00:00:00+00'),
('Laurent','Maxime','m.laurent@gmail.com','$2b$11$GuAgXkPf5qQDGQat92bS3uJpdopFa7RBZAvqdThtdvZUR3h4cCF8m','0698009900',0,NULL,'2025-06-01 00:00:00+00'),
('Michel','Inès','i.michel@yahoo.fr','$2b$11$GuAgXkPf5qQDGQat92bS3uJpdopFa7RBZAvqdThtdvZUR3h4cCF8m','0698111222',0,NULL,'2025-06-20 00:00:00+00'),
('Garcia','Théo','t.garcia@gmail.com','$2b$11$GuAgXkPf5qQDGQat92bS3uJpdopFa7RBZAvqdThtdvZUR3h4cCF8m','0698333444',0,NULL,'2025-07-10 00:00:00+00'),
('David','Chloé','c.david@outlook.com','$2b$11$GuAgXkPf5qQDGQat92bS3uJpdopFa7RBZAvqdThtdvZUR3h4cCF8m','0698555666',0,NULL,'2025-08-01 00:00:00+00');
