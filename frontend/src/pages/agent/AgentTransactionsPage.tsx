import { useEffect, useState } from "react";
import api from "../../api/client";
import type { Transaction } from "../../api/types";

const formatPrix = (p: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(p);

const STATUT_STYLES: Record<string, string> = {
  EnCours: "border-blue-300 text-blue-700 bg-blue-50",
  SousCompromis: "border-amber-300 text-amber-700 bg-amber-50",
  Finalisee: "border-green-300 text-green-700 bg-green-50",
  Annulee: "border-red-300 text-red-700 bg-red-50",
};

const STATUT_LABELS: Record<string, string> = {
  EnCours: "En cours", SousCompromis: "Sous compromis", Finalisee: "Finalisée", Annulee: "Annulée",
};

export default function AgentTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTx = () => {
    api.get("/transactions").then((r) => setTransactions(r.data)).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(fetchTx, []);

  const updateStatut = async (id: number, statut: string) => {
    await api.patch(`/transactions/${id}/statut`, { statut });
    fetchTx();
  };

  return (
    <div>
      <p className="font-body text-xs tracking-[0.2em] uppercase text-[#B8962E] mb-2">Gestion</p>
      <h1 className="font-display text-3xl text-[#0D0D0D] mb-8">Transactions</h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border border-[#0D0D0D] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : transactions.length === 0 ? (
        <p className="font-body text-sm text-[#6B6560] py-12">Aucune transaction.</p>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div key={tx.id} className="border border-[#D9D4CC] p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <p className="font-display text-xl text-[#0D0D0D]">{tx.bienTitre}</p>
                  <p className="font-body text-xs text-[#6B6560] mt-1">{tx.bienVille}</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl text-[#0D0D0D]">{formatPrix(tx.montantFinal)}</p>
                  <span className={`inline-block font-body text-[10px] tracking-widest uppercase px-3 py-1 border mt-2 ${STATUT_STYLES[tx.statut] ?? ""}`}>
                    {STATUT_LABELS[tx.statut] ?? tx.statut}
                  </span>
                </div>
              </div>

              <div className="border-t border-[#D9D4CC] pt-4 grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="font-body text-[10px] tracking-widest uppercase text-[#6B6560]">Acheteur</p>
                  <p className="font-body text-sm text-[#0D0D0D] mt-1">{tx.acheteurNom}</p>
                </div>
                <div>
                  <p className="font-body text-[10px] tracking-widest uppercase text-[#6B6560]">Vendeur</p>
                  <p className="font-body text-sm text-[#0D0D0D] mt-1">{tx.vendeurNom}</p>
                </div>
              </div>

              {(tx.statut === "EnCours" || tx.statut === "SousCompromis") && (
                <div className="flex gap-3 mt-4 pt-4 border-t border-[#D9D4CC]">
                  {tx.statut === "EnCours" && (
                    <button onClick={() => updateStatut(tx.id, "SousCompromis")} className="btn-primary text-xs">Passer sous compromis</button>
                  )}
                  {tx.statut === "SousCompromis" && (
                    <button onClick={() => updateStatut(tx.id, "Finalisee")} className="btn-primary text-xs">Finaliser</button>
                  )}
                  <button onClick={() => updateStatut(tx.id, "Annulee")} className="btn-secondary text-xs">Annuler</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
