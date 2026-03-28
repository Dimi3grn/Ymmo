import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, Zap, Check } from "lucide-react";
import api from "../api/client";
import type { Bien } from "../api/types";
import { useAuth } from "../context/AuthContext";

const FEATURES: { key: keyof Bien; label: string }[] = [
  { key: "ascenseur", label: "Ascenseur" },
  { key: "parking", label: "Parking" },
  { key: "balcon", label: "Balcon" },
  { key: "jardin", label: "Jardin" },
  { key: "piscine", label: "Piscine" },
];

export default function BienDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [bien, setBien] = useState<Bien | null>(null);
  const [loading, setLoading] = useState(true);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [score, setScore] = useState<any>(null);
  const [rdvDate, setRdvDate] = useState("");
  const [rdvNotes, setRdvNotes] = useState("");
  const [rdvSent, setRdvSent] = useState(false);
  const [rdvError, setRdvError] = useState("");
  const [showRdvForm, setShowRdvForm] = useState(false);

  const handleRdv = async (e: React.FormEvent) => {
    e.preventDefault();
    setRdvError("");
    try {
      await api.post("/rendezvous", { bienId: parseInt(id!), dateHeure: new Date(rdvDate).toISOString(), notes: rdvNotes || undefined });
      setRdvSent(true);
      setShowRdvForm(false);
    } catch (err: any) {
      setRdvError(err.response?.data?.message ?? "Erreur lors de l'envoi.");
    }
  };

  useEffect(() => {
    api.get(`/biens/${id}`)
      .then((res) => setBien(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
    api.get(`/scores/bien/${id}`)
      .then((res) => setScore(res.data))
      .catch(() => {});
  }, [id]);

  const formatPrix = (p: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(p);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border border-[#0D0D0D] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!bien) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20 text-center">
        <p className="font-display text-3xl text-[#0D0D0D]">Bien introuvable</p>
        <Link to="/biens" className="btn-secondary mt-8 inline-flex">← Retour aux biens</Link>
      </div>
    );
  }

  const photos = bien.photos;
  const photoPrincipale = photos.find((p) => p.estPrincipale) ?? photos[0];
  const photosRestantes = photos.filter((p) => p !== photoPrincipale);
  const activePhoto = photos[photoIndex];

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-[#D9D4CC] px-6 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto">
          <Link
            to="/biens"
            className="inline-flex items-center gap-2 font-body text-xs tracking-widest uppercase text-[#6B6560] hover:text-[#0D0D0D] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Tous les biens
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 lg:py-16">
        <div className="grid lg:grid-cols-[1fr_380px] gap-12 lg:gap-20">

          {/* Colonne gauche — visuels + détails */}
          <div>
            {/* Photo principale */}
            <div className="aspect-[4/3] bg-[#F5F0E8] overflow-hidden mb-3">
              {activePhoto ? (
                <img
                  src={activePhoto.url}
                  alt={bien.titre}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="font-display text-8xl text-[#D9D4CC]">Y</span>
                </div>
              )}
            </div>

            {/* Miniatures */}
            {photos.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {photos.map((photo, i) => (
                  <button
                    key={photo.id}
                    onClick={() => setPhotoIndex(i)}
                    className={`w-20 h-16 shrink-0 overflow-hidden border-2 transition-colors ${i === photoIndex ? "border-[#0D0D0D]" : "border-transparent"}`}
                  >
                    <img src={photo.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="mt-10">
              <p className="font-body text-[10px] tracking-[0.2em] uppercase text-[#6B6560] mb-4">Description</p>
              <p className="font-body text-sm text-[#0D0D0D] leading-relaxed font-300">
                {bien.description ?? "Aucune description disponible."}
              </p>
            </div>

            {/* Caractéristiques */}
            <div className="mt-10 border-t border-[#D9D4CC] pt-10">
              <p className="font-body text-[10px] tracking-[0.2em] uppercase text-[#6B6560] mb-6">Caractéristiques</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {[
                  { label: "Surface", value: `${bien.surface} m²` },
                  { label: "Pièces", value: bien.nbPieces },
                  { label: "Chambres", value: bien.nbChambres },
                  { label: "Type", value: bien.type },
                  ...(bien.anneeConstruction ? [{ label: "Construction", value: bien.anneeConstruction }] : []),
                  ...(bien.dpe ? [{ label: "DPE", value: bien.dpe }] : []),
                ].map((item) => (
                  <div key={item.label}>
                    <p className="font-body text-[10px] tracking-widest uppercase text-[#6B6560]">{item.label}</p>
                    <p className="font-display text-2xl text-[#0D0D0D] mt-1">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Équipements */}
            {FEATURES.some((f) => bien[f.key]) && (
              <div className="mt-10 border-t border-[#D9D4CC] pt-10">
                <p className="font-body text-[10px] tracking-[0.2em] uppercase text-[#6B6560] mb-6">Équipements</p>
                <div className="flex flex-wrap gap-3">
                  {FEATURES.filter((f) => bien[f.key]).map((f) => (
                    <span
                      key={f.key}
                      className="border border-[#D9D4CC] font-body text-xs tracking-wide px-4 py-2 text-[#0D0D0D]"
                    >
                      {f.label}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Colonne droite — infos + CTA */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="border border-[#D9D4CC] p-8">
              <p className="font-body text-xs tracking-widest uppercase text-[#B8962E] mb-3">
                {bien.type} · {bien.statut}
              </p>
              <h1 className="font-display text-2xl lg:text-3xl text-[#0D0D0D] leading-tight mb-2">
                {bien.titre}
              </h1>
              <p className="font-body text-sm text-[#6B6560] flex items-center gap-1.5 mb-8">
                <MapPin className="h-3.5 w-3.5" />
                {bien.adresse}, {bien.codePostal} {bien.ville}
              </p>

              <div className="border-t border-[#D9D4CC] pt-8 mb-8">
                <p className="font-body text-[10px] tracking-widest uppercase text-[#6B6560] mb-2">Prix</p>
                <p className="font-display text-4xl text-[#0D0D0D]">{formatPrix(bien.prix)}</p>
                {bien.surface > 0 && (
                  <p className="font-body text-xs text-[#6B6560] mt-1">
                    {formatPrix(Math.round(bien.prix / bien.surface))} / m²
                  </p>
                )}
              </div>

              {isAuthenticated && !rdvSent && !showRdvForm && (
                <button onClick={() => setShowRdvForm(true)} className="btn-primary w-full justify-center mb-3">
                  Demander une visite
                </button>
              )}

              {!isAuthenticated && (
                <Link to="/login" className="btn-primary w-full justify-center mb-3">
                  Se connecter pour visiter
                </Link>
              )}

              {rdvSent && (
                <div className="flex items-center gap-2 border border-green-300 bg-green-50 text-green-700 font-body text-xs px-4 py-3 mb-3">
                  <Check className="h-4 w-4" /> Demande envoyée
                </div>
              )}

              {showRdvForm && (
                <form onSubmit={handleRdv} className="mb-3 space-y-4">
                  <div>
                    <label className="font-body text-[10px] tracking-[0.15em] uppercase text-[#6B6560] block mb-2">Date souhaitée</label>
                    <input type="datetime-local" required value={rdvDate} onChange={(e) => setRdvDate(e.target.value)} className="input-field text-sm" />
                  </div>
                  <div>
                    <label className="font-body text-[10px] tracking-[0.15em] uppercase text-[#6B6560] block mb-2">Message (optionnel)</label>
                    <textarea value={rdvNotes} onChange={(e) => setRdvNotes(e.target.value)} rows={3} className="input-field text-sm resize-none" />
                  </div>
                  {rdvError && <p className="font-body text-xs text-red-600">{rdvError}</p>}
                  <button type="submit" className="btn-primary w-full justify-center">Envoyer la demande</button>
                  <button type="button" onClick={() => setShowRdvForm(false)} className="btn-secondary w-full justify-center">Annuler</button>
                </form>
              )}

              {/* Infos agence */}
              <div className="border-t border-[#D9D4CC] mt-8 pt-8">
                <p className="font-body text-[10px] tracking-widest uppercase text-[#6B6560] mb-3">Agence</p>
                <p className="font-body text-sm font-500 text-[#0D0D0D]">{bien.agenceNom}</p>
                {bien.agentNom && (
                  <p className="font-body text-xs text-[#6B6560] mt-1">
                    Agent : {bien.agentNom}
                  </p>
                )}
              </div>

              {/* DPE badge */}
              {bien.dpe && (
                <div className="border-t border-[#D9D4CC] mt-6 pt-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#0D0D0D] flex items-center justify-center">
                    <Zap className="h-5 w-5 text-[#D4AF6A]" />
                  </div>
                  <div>
                    <p className="font-body text-[10px] tracking-widest uppercase text-[#6B6560]">Classe énergie</p>
                    <p className="font-display text-xl text-[#0D0D0D]">{bien.dpe}</p>
                  </div>
                </div>
              )}

              {bien.anneeConstruction && (
                <div className="border-t border-[#D9D4CC] mt-6 pt-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F5F0E8] flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-[#6B6560]" />
                  </div>
                  <div>
                    <p className="font-body text-[10px] tracking-widest uppercase text-[#6B6560]">Année</p>
                    <p className="font-display text-xl text-[#0D0D0D]">{bien.anneeConstruction}</p>
                  </div>
                </div>
              )}

              {/* Score Ymmo */}
              {score?.score_total != null && (
                <div className="border-t border-[#D9D4CC] mt-6 pt-6">
                  <p className="font-body text-[10px] tracking-widest uppercase text-[#6B6560] mb-4">Score Ymmo</p>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="font-display text-5xl text-[#B8962E]">{score.score_total}</span>
                    <span className="font-body text-sm text-[#6B6560]">/ 10</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: "Qualité / Prix", value: score.detail?.qualite_prix?.score ?? score.detail?.qualite_prix },
                      { label: "Demande zone", value: score.detail?.demande_zone?.score ?? score.detail?.demande_zone },
                      { label: "Prédiction", value: score.detail?.prediction?.score ?? score.detail?.prediction },
                    ].map((s) => (
                      <div key={s.label}>
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-body text-[10px] tracking-widest uppercase text-[#6B6560]">{s.label}</p>
                          <p className="font-body text-xs font-500 text-[#0D0D0D]">{s.value}/10</p>
                        </div>
                        <div className="h-1 bg-[#F5F0E8]">
                          <div className="h-1 bg-[#B8962E] transition-all" style={{ width: `${(s.value / 10) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  {score.detail?.prediction?.interpretation && (
                    <p className="font-body text-xs text-[#6B6560] mt-4 italic">{score.detail.prediction.interpretation}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
