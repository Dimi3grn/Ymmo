-- Correction des URLs Unsplash potentiellement expirées
UPDATE "PhotosBien" SET "Url" = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop' WHERE "BienId" = 5 AND "EstPrincipale" = true;
UPDATE "PhotosBien" SET "Url" = 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop' WHERE "BienId" = 5 AND "EstPrincipale" = false;
UPDATE "PhotosBien" SET "Url" = 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop' WHERE "BienId" = 14 AND "EstPrincipale" = true;
UPDATE "PhotosBien" SET "Url" = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop' WHERE "BienId" = 9 AND "EstPrincipale" = true;
