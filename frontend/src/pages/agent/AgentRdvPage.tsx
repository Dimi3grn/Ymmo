import { useEffect, useState } from "react";
import api from "../../api/client";
import { getApiErrorMessage } from "../../api/error";
import type { RendezVous } from "../../api/types";

const STATUT_STYLES: Record<string, string> = {
  Planifie: "border-blue-300 text-blue-700 bg-blue-50",
  Confirme: "border-green-300 text-green-700 bg-green-50",
  Annule: "border-red-300 text-red-700 bg-red-50",
  Effectue: "border-[#D9D4CC] text-[#6B6560] bg-[#F5F0E8]",
};

export default function AgentRdvPage() {
  const [rdvs, setRdvs] = useState<RendezVous[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRdvs = () => {
    api.get("/rendezvous").then((r) => setRdvs(r.data)).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(fetchRdvs, []);

  const updateStatut = async (id: number, statut: string) => {
    try {
      await api.patch(`/rendezvous/${id}/statut`, { statut });
      fetchRdvs();
    } catch (err) {
      alert(getApiErrorMessage(err, "Impossible de mettre à jour le rendez-vous."));
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
  });

  return (
    <div>
      <p className="font-body text-xs tracking-[0.2em] uppercase text-[#B8962E] mb-2">Gestion</p>
      <h1 className="font-display text-2xl sm:text-3xl text-[#0D0D0D] mb-6 sm:mb-8">Demandes de visite</h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border border-[#0D0D0D] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : rdvs.length === 0 ? (
        <p className="font-body text-sm text-[#6B6560] py-12">Aucune demande de visite.</p>
      ) : (
        <div className="space-y-4">
          {rdvs.map((rdv) => (
            <div key={rdv.id} className="border border-[#D9D4CC] p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <p className="font-display text-xl text-[#0D0D0D]">{rdv.bienTitre}</p>
                  <p className="font-body text-xs text-[#6B6560] mt-1">{rdv.bienVille} · {formatDate(rdv.dateHeure)}</p>
                </div>
                <span className={`font-body text-[10px] tracking-widest uppercase px-3 py-1 border self-start ${STATUT_STYLES[rdv.statut] ?? "border-[#D9D4CC]"}`}>
                  {rdv.statut}
                </span>
              </div>

              <div className="border-t border-[#D9D4CC] pt-4 grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="font-body text-[10px] tracking-widest uppercase text-[#6B6560]">Client</p>
                  <p className="font-body text-sm text-[#0D0D0D] mt-1">{rdv.clientNom}</p>
                  <p className="font-body text-xs text-[#6B6560]">{rdv.clientEmail}</p>
                  {rdv.clientTelephone && <p className="font-body text-xs text-[#6B6560]">{rdv.clientTelephone}</p>}
                </div>
                {rdv.notes && (
                  <div>
                    <p className="font-body text-[10px] tracking-widest uppercase text-[#6B6560]">Notes</p>
                    <p className="font-body text-sm text-[#0D0D0D] mt-1">{rdv.notes}</p>
                  </div>
                )}
              </div>

              {rdv.statut === "Planifie" && (
                <div className="flex gap-3 mt-4 pt-4 border-t border-[#D9D4CC]">
                  <button onClick={() => updateStatut(rdv.id, "Confirme")} className="btn-primary text-xs">Confirmer</button>
                  <button onClick={() => updateStatut(rdv.id, "Annule")} className="btn-secondary text-xs">Refuser</button>
                </div>
              )}
              {rdv.statut === "Confirme" && (
                <div className="mt-4 pt-4 border-t border-[#D9D4CC]">
                  <button onClick={() => updateStatut(rdv.id, "Effectue")} className="btn-primary text-xs">Marquer effectué</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
