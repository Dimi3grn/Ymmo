import { useEffect, useState } from "react";
import api from "../../api/client";
import type { ClientInfo } from "../../api/types";

export default function AgentClientsPage() {
  const [clients, setClients] = useState<ClientInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/utilisateurs/clients").then((r) => setClients(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <p className="font-body text-xs tracking-[0.2em] uppercase text-[#B8962E] mb-2">Gestion</p>
      <h1 className="font-display text-3xl text-[#0D0D0D] mb-8">Dossiers clients</h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border border-[#0D0D0D] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : clients.length === 0 ? (
        <p className="font-body text-sm text-[#6B6560] py-12">Aucun client inscrit.</p>
      ) : (
        <div className="border border-[#D9D4CC] overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F5F0E8] border-b border-[#D9D4CC]">
                {["Nom", "Email", "Téléphone", "Inscrit le"].map((h) => (
                  <th key={h} className="text-left px-6 py-4 font-body text-[10px] tracking-[0.15em] uppercase text-[#6B6560] font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-b border-[#D9D4CC] last:border-b-0">
                  <td className="px-6 py-4 font-body text-sm font-500 text-[#0D0D0D]">{c.prenom} {c.nom}</td>
                  <td className="px-6 py-4 font-body text-sm text-[#6B6560]">{c.email}</td>
                  <td className="px-6 py-4 font-body text-sm text-[#6B6560]">{c.telephone ?? "—"}</td>
                  <td className="px-6 py-4 font-body text-sm text-[#6B6560]">{new Date(c.dateCreation).toLocaleDateString("fr-FR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
