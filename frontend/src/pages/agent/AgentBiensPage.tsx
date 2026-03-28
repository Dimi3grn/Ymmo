import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil } from "lucide-react";
import api from "../../api/client";
import type { Bien } from "../../api/types";

const formatPrix = (p: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(p);

const STATUT_LABELS: Record<string, string> = {
  Disponible: "Disponible",
  SousCompromis: "Sous compromis",
  Vendu: "Vendu",
  Retire: "Retiré",
};

export default function AgentBiensPage() {
  const [biens, setBiens] = useState<Bien[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/biens?taille=100").then((r) => setBiens(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-body text-xs tracking-[0.2em] uppercase text-[#B8962E] mb-2">Gestion</p>
          <h1 className="font-display text-3xl text-[#0D0D0D]">Biens immobiliers</h1>
        </div>
        <Link to="/agent/biens/nouveau" className="btn-primary text-xs">
          <Plus className="h-3.5 w-3.5" /> Ajouter
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border border-[#0D0D0D] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="border border-[#D9D4CC] overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F5F0E8] border-b border-[#D9D4CC]">
                {["Bien", "Ville", "Type", "Prix", "Statut", ""].map((h) => (
                  <th key={h} className="text-left px-6 py-4 font-body text-[10px] tracking-[0.15em] uppercase text-[#6B6560] font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {biens.map((b) => (
                <tr key={b.id} className="border-b border-[#D9D4CC] last:border-b-0">
                  <td className="px-6 py-4 font-body text-sm text-[#0D0D0D]">{b.titre}</td>
                  <td className="px-6 py-4 font-body text-sm text-[#6B6560]">{b.ville}</td>
                  <td className="px-6 py-4 font-body text-sm text-[#6B6560]">{b.type}</td>
                  <td className="px-6 py-4 font-body text-sm font-500 text-[#0D0D0D]">{formatPrix(b.prix)}</td>
                  <td className="px-6 py-4">
                    <span className={`font-body text-[10px] tracking-widest uppercase px-3 py-1 border ${b.statut === "Disponible" ? "border-green-300 text-green-700 bg-green-50" : b.statut === "Vendu" ? "border-[#D9D4CC] text-[#6B6560] bg-[#F5F0E8]" : "border-amber-300 text-amber-700 bg-amber-50"}`}>
                      {STATUT_LABELS[b.statut] ?? b.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link to={`/agent/biens/${b.id}/modifier`} className="text-[#6B6560] hover:text-[#0D0D0D] transition-colors">
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
