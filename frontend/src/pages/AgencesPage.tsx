import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import api from "../api/client";
import type { Agence } from "../api/types";

export default function AgencesPage() {
  const [agences, setAgences] = useState<Agence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/agences")
      .then((res) => setAgences(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const siege = agences.find((a) => a.estSiege);
  const autres = agences.filter((a) => !a.estSiege);

  return (
    <div className="min-h-screen">
      {/* En-tête */}
      <div className="bg-[#F5F0E8] border-b border-[#D9D4CC] px-6 lg:px-12 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto">
          <p className="font-body text-xs tracking-[0.2em] uppercase text-[#B8962E] mb-3">Présence nationale</p>
          <h1 className="font-display text-4xl lg:text-5xl text-[#0D0D0D]">Nos agences</h1>
          <p className="font-body text-sm text-[#6B6560] mt-3 max-w-lg leading-relaxed">
            Un réseau de 13 agences réparties sur l'ensemble du territoire français pour vous accompagner au plus près.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 lg:py-20">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-6 h-6 border border-[#0D0D0D] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Siège en avant */}
            {siege && (
              <div className="mb-16">
                <p className="font-body text-[10px] tracking-[0.2em] uppercase text-[#6B6560] mb-6">Siège social</p>
                <div className="border border-[#0D0D0D] p-8 lg:p-12 grid lg:grid-cols-2 gap-8">
                  <div>
                    <p className="font-body text-xs tracking-widest uppercase text-[#B8962E] mb-3">Siège social</p>
                    <h2 className="font-display text-3xl lg:text-4xl text-[#0D0D0D] mb-4">{siege.nom}</h2>
                    <p className="font-body text-sm text-[#6B6560] flex items-start gap-2">
                      <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                      {siege.adresse}, {siege.codePostal} {siege.ville}
                    </p>
                  </div>
                  <div className="flex items-end justify-start lg:justify-end">
                    <div className="flex gap-12">
                      <div>
                        <p className="font-display text-3xl text-[#0D0D0D]">{siege.nbAgents}</p>
                        <p className="font-body text-[10px] tracking-widest uppercase text-[#6B6560] mt-1">Collaborateurs</p>
                      </div>
                      <div>
                        <p className="font-display text-3xl text-[#0D0D0D]">{siege.nbBiens}</p>
                        <p className="font-body text-[10px] tracking-widest uppercase text-[#6B6560] mt-1">Biens</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Grille agences */}
            <p className="font-body text-[10px] tracking-[0.2em] uppercase text-[#6B6560] mb-6">Réseau national</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-0 border-l border-t border-[#D9D4CC]">
              {autres.map((agence) => (
                <div
                  key={agence.id}
                  className="border-r border-b border-[#D9D4CC] p-8 hover:bg-[#F5F0E8] transition-colors duration-200 group"
                >
                  <p className="font-display text-xl text-[#0D0D0D] group-hover:text-[#B8962E] transition-colors mb-3">
                    {agence.ville}
                  </p>
                  <p className="font-body text-xs text-[#6B6560] flex items-start gap-1.5 mb-5">
                    <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    {agence.adresse}
                  </p>
                  <div className="flex gap-8 pt-4 border-t border-[#D9D4CC]">
                    <div>
                      <p className="font-body text-sm font-500 text-[#0D0D0D]">{agence.nbAgents}</p>
                      <p className="font-body text-[10px] tracking-widest uppercase text-[#6B6560]">Agents</p>
                    </div>
                    <div>
                      <p className="font-body text-sm font-500 text-[#0D0D0D]">{agence.nbBiens}</p>
                      <p className="font-body text-[10px] tracking-widest uppercase text-[#6B6560]">Biens</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
