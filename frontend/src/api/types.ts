export interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role: string;
  agenceId?: number;
  agenceNom?: string;
}

export interface AuthResponse {
  token: string;
  utilisateur: Utilisateur;
}

export interface Bien {
  id: number;
  titre: string;
  description?: string;
  type: string;
  statut: string;
  prix: number;
  surface: number;
  nbPieces: number;
  nbChambres: number;
  adresse: string;
  ville: string;
  codePostal: string;
  latitude?: number;
  longitude?: number;
  anneeConstruction?: number;
  dpe?: string;
  ascenseur: boolean;
  parking: boolean;
  balcon: boolean;
  jardin: boolean;
  piscine: boolean;
  agenceNom: string;
  agentNom?: string;
  dateCreation: string;
  photos: Photo[];
}

export interface Photo {
  id: number;
  url: string;
  estPrincipale: boolean;
}

export interface Agence {
  id: number;
  nom: string;
  adresse: string;
  ville: string;
  codePostal: string;
  telephone?: string;
  email?: string;
  estSiege: boolean;
  nbAgents: number;
  nbBiens: number;
}

export interface RendezVous {
  id: number;
  dateHeure: string;
  notes?: string;
  statut: string;
  bienId: number;
  bienTitre: string;
  bienVille: string;
  clientId: number;
  clientNom: string;
  clientEmail: string;
  clientTelephone?: string;
  agentId: number;
  agentNom: string;
}

export interface Transaction {
  id: number;
  montantFinal: number;
  statut: string;
  bienId: number;
  bienTitre: string;
  bienVille: string;
  bienPrix: number;
  acheteurId: number;
  acheteurNom: string;
  vendeurId: number;
  vendeurNom: string;
  agentId?: number;
  agentNom?: string;
  dateCreation: string;
  dateFinalisation?: string;
}

export interface ClientInfo {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  dateCreation: string;
}
