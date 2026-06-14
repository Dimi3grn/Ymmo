import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/client";
import { getApiErrorMessage } from "../../api/error";
import type { RendezVous, Transaction } from "../../api/types";

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

const formatPrix = (p: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(p);

const RDV_STATUT: Record<string, string> = {
  Planifie: "border-blue-300 text-blue-700 bg-blue-50",
  Confirme: "border-green-300 text-green-700 bg-green-50",
  Annule: "border-red-300 text-red-700 bg-red-50",
  Effectue: "border-[#D9D4CC] text-[#6B6560] bg-[#F5F0E8]",
};

const TX_STATUT: Record<string, string> = {
  EnCours: "En cours", SousCompromis: "Sous compromis", Finalisee: "Finalisée", Annulee: "Annulée",
};

export default function ClientEspacePage() {
  const { utilisateur } = useAuth();
  const [rdvs, setRdvs] = useState<RendezVous[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [offerRdvId, setOfferRdvId] = useState<number | null>(null);
  const [offerMontant, setOfferMontant] = useState("");
  const [offerLoading, setOfferLoading] = useState(false);
  const [offerError, setOfferError] = useState("");

  const fetchData = () => {
    Promise.all([
      api.get("/rendezvous").catch(() => ({ data: [] })),
      api.get("/transactions").catch(() => ({ data: [] })),
    ]).then(([r, t]) => {
      setRdvs(r.data);
      setTransactions(t.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const submitOffer = async (rdvId: number) => {
    setOfferError("");
    setOfferLoading(true);
    try {
      const montant = parseFloat(offerMontant);
      if (isNaN(montant) || montant <= 0) {
        setOfferError("Montant invalide.");
        return;
      }
      await api.post("/transactions/offre", { rendezVousId: rdvId, montant });
      setOfferRdvId(null);
      setOfferMontant("");
      fetchData();
    } catch (err) {
      setOfferError(getApiErrorMessage(err, "Erreur lors de l'envoi."));
    } finally {
      setOfferLoading(false);
    }
  };

  const getTransactionForBien = (bienId: number) =>
    transactions.find((t) => t.bienId === bienId && t.statut !== "Annulee");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border border-[#0D0D0D] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-12 py-10 lg:py-16">
      <p className="font-body text-xs tracking-[0.2em] uppercase text-[#B8962E] mb-2">Mon espace</p>
      <h1 className="font-display text-4xl text-[#0D0D0D] mb-2">
        Bonjour, {utilisateur?.prenom}
      </h1>
      <p className="font-body text-sm text-[#6B6560] mb-12">Suivez vos démarches immobilières.</p>

      {/* Demandes de visite */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <p className="font-body text-[10px] tracking-[0.2em] uppercase text-[#6B6560]">Mes demandes de visite</p>
          <Link to="/biens" className="link-underline link-underline-gold font-body text-xs tracking-widest uppercase text-[#B8962E]">
            Voir les biens
          </Link>
        </div>
        {rdvs.length === 0 ? (
          <div className="border border-[#D9D4CC] p-8 text-center">
            <p className="font-body text-sm text-[#6B6560]">Vous n'avez pas encore de demande de visite.</p>
            <Link to="/biens" className="btn-primary text-xs mt-4 inline-flex">Découvrir les biens</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {rdvs.map((rdv) => (
              <div key={rdv.id} className="border border-[#D9D4CC] p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <Link to={`/biens/${rdv.bienId}`} className="font-display text-lg text-[#0D0D0D] hover:text-[#B8962E] transition-colors">
                      {rdv.bienTitre}
                    </Link>
                    <p className="font-body text-xs text-[#6B6560] mt-1">{rdv.bienVille} · {formatDate(rdv.dateHeure)}</p>
                    <p className="font-body text-xs text-[#6B6560] mt-0.5">Agent : {rdv.agentNom}</p>
                  </div>
                  <div className="flex items-center gap-3 self-start">
                    <span className={`font-body text-[10px] tracking-widest uppercase px-3 py-1 border ${RDV_STATUT[rdv.statut] ?? "border-[#D9D4CC]"}`}>
                      {rdv.statut}
                    </span>
                    {rdv.statut === "Effectue" && !getTransactionForBien(rdv.bienId) && offerRdvId !== rdv.id && (
                      <button
                        onClick={() => { setOfferRdvId(rdv.id); setOfferError(""); }}
                        className="btn-primary text-[10px] py-1.5 px-4"
                      >
                        Faire une offre
                      </button>
                    )}
                    {(() => {
                      const tx = getTransactionForBien(rdv.bienId);
                      if (!tx || rdv.statut !== "Effectue") return null;
                      const labels: Record<string, { text: string; cls: string }> = {
                        EnCours: { text: "Offre en cours d'examen", cls: "border-blue-300 text-blue-700 bg-blue-50" },
                        SousCompromis: { text: "Sous compromis", cls: "border-[#B8962E] text-[#B8962E] bg-[#F5F0E8]" },
                        Finalisee: { text: "Vente finalisée", cls: "border-green-300 text-green-700 bg-green-50" },
                        Annulee: { text: "Offre annulée", cls: "border-red-300 text-red-700 bg-red-50" },
                      };
                      const info = labels[tx.statut] ?? { text: tx.statut, cls: "border-[#D9D4CC]" };
                      return (
                        <span className={`font-body text-[10px] tracking-widest uppercase px-3 py-1 border ${info.cls}`}>
                          {info.text}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {/* Formulaire d'offre inline */}
                {offerRdvId === rdv.id && (
                  <div className="mt-4 pt-4 border-t border-[#D9D4CC]">
                    <p className="font-body text-xs text-[#6B6560] mb-3">Proposez votre offre d'achat :</p>
                    {offerError && <p className="font-body text-xs text-red-600 mb-2">{offerError}</p>}
                    <div className="flex items-end gap-3">
                      <div className="flex-1 max-w-xs">
                        <label className="font-body text-[10px] tracking-widest uppercase text-[#6B6560] mb-1 block">Montant (€)</label>
                        <input
                          type="number"
                          value={offerMontant}
                          onChange={(e) => setOfferMontant(e.target.value)}
                          placeholder="Ex: 250000"
                          className="input-field"
                        />
                      </div>
                      <button
                        onClick={() => submitOffer(rdv.id)}
                        disabled={offerLoading}
                        className="btn-primary text-xs disabled:opacity-50"
                      >
                        {offerLoading ? "Envoi..." : "Envoyer l'offre"}
                      </button>
                      <button
                        onClick={() => { setOfferRdvId(null); setOfferError(""); }}
                        className="font-body text-xs text-[#6B6560] hover:text-[#0D0D0D] transition-colors tracking-widest uppercase"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Transactions */}
      <section>
        <p className="font-body text-[10px] tracking-[0.2em] uppercase text-[#6B6560] mb-6">Mes transactions</p>
        {transactions.length === 0 ? (
          <div className="border border-[#D9D4CC] p-8 text-center">
            <p className="font-body text-sm text-[#6B6560]">Aucune transaction en cours.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="border border-[#D9D4CC] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <Link to={`/biens/${tx.bienId}`} className="font-display text-lg text-[#0D0D0D] hover:text-[#B8962E] transition-colors">
                    {tx.bienTitre}
                  </Link>
                  <p className="font-body text-xs text-[#6B6560] mt-1">{tx.bienVille}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-xl text-[#0D0D0D]">{formatPrix(tx.montantFinal)}</p>
                  <p className="font-body text-[10px] tracking-widest uppercase text-[#6B6560] mt-1">
                    {TX_STATUT[tx.statut] ?? tx.statut}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
