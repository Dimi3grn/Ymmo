import { useEffect, useState } from "react";
import api from "../api/client";

interface StatsMarche {
  total_biens: number;
  prix_moyen: number;
  prix_median: number;
  surface_moyenne: number;
  par_type: Record<string, { count: number; prix_moyen: number; surface_moyenne: number }>;
  par_ville: Record<string, { count: number; prix_moyen: number }>;
}

interface StatsAgence {
  id: number;
  nom: string;
  ville: string;
  nb_biens: number;
  nb_ventes: number;
  chiffre_affaires: number;
}


const formatEur = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

export default function DashboardPage() {
  const [marche, setMarche] = useState<StatsMarche | null>(null);
  const [agences, setAgences] = useState<StatsAgence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/stats/marche").catch(() => null),
      api.get("/stats/agences").catch(() => null),
    ])
      .then(([marcheRes, agencesRes]) => {
        if (marcheRes) setMarche(marcheRes.data);
        if (agencesRes) setAgences(agencesRes.data);
        if (!marcheRes && !agencesRes) setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border border-[#0D0D0D] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20 text-center">
        <p className="font-display text-3xl text-[#0D0D0D] mb-3">Service indisponible</p>
        <p className="font-body text-sm text-[#6B6560]">
          Le microservice d'analyse (port 8000) n'est pas lancé.
        </p>
      </div>
    );
  }

  const TYPE_LABELS: Record<string, string> = {
    "0": "Appartement", "1": "Maison", "2": "Terrain", "3": "Local", "4": "Bureau",
  };

  return (
    <div className="min-h-screen">
      {/* En-tête */}
      <div className="bg-[#0D0D0D] px-6 lg:px-12 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto">
          <p className="font-body text-xs tracking-[0.2em] uppercase text-[#D4AF6A] mb-3">Analytique</p>
          <h1 className="font-display text-4xl lg:text-5xl text-white">Tableau de bord</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 lg:py-20">

        {/* KPIs */}
        {marche && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 border border-[#D9D4CC] mb-12">
            {[
              { label: "Biens disponibles", value: marche.total_biens.toString() },
              { label: "Prix moyen", value: formatEur(marche.prix_moyen) },
              { label: "Prix médian", value: formatEur(marche.prix_median) },
              { label: "Surface moyenne", value: `${marche.surface_moyenne} m²` },
            ].map((kpi, i) => (
              <div
                key={kpi.label}
                className={`p-8 ${i < 3 ? "border-r border-[#D9D4CC]" : ""} ${i < 2 ? "border-b lg:border-b-0 border-[#D9D4CC]" : ""}`}
              >
                <p className="font-body text-[10px] tracking-[0.15em] uppercase text-[#6B6560] mb-3">{kpi.label}</p>
                <p className="font-display text-3xl text-[#0D0D0D]">{kpi.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Répartition par type */}
        {marche?.par_type && (
          <div className="mb-12">
            <p className="font-body text-[10px] tracking-[0.2em] uppercase text-[#6B6560] mb-6">Par type de bien</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-0 border-l border-t border-[#D9D4CC]">
              {Object.entries(marche.par_type).map(([typeKey, data]) => (
                <div key={typeKey} className="border-r border-b border-[#D9D4CC] p-6">
                  <p className="font-body text-xs tracking-widest uppercase text-[#B8962E] mb-2">
                    {TYPE_LABELS[typeKey] ?? `Type ${typeKey}`}
                  </p>
                  <p className="font-display text-2xl text-[#0D0D0D]">{data.count} biens</p>
                  <p className="font-body text-xs text-[#6B6560] mt-1">
                    Prix moy. {formatEur(data.prix_moyen)} · {data.surface_moyenne} m² moy.
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Répartition par ville */}
        {marche?.par_ville && (
          <div className="mb-12">
            <p className="font-body text-[10px] tracking-[0.2em] uppercase text-[#6B6560] mb-6">Par ville</p>
            <div className="border border-[#D9D4CC]">
              <div className="grid grid-cols-3 px-6 py-4 border-b border-[#D9D4CC] bg-[#F5F0E8]">
                <p className="font-body text-[10px] tracking-[0.15em] uppercase text-[#6B6560]">Ville</p>
                <p className="font-body text-[10px] tracking-[0.15em] uppercase text-[#6B6560] text-right">Biens</p>
                <p className="font-body text-[10px] tracking-[0.15em] uppercase text-[#6B6560] text-right">Prix moyen</p>
              </div>
              {Object.entries(marche.par_ville)
                .sort(([, a], [, b]) => b.count - a.count)
                .map(([ville, data]) => (
                  <div key={ville} className="grid grid-cols-3 px-6 py-4 border-b border-[#D9D4CC] last:border-b-0">
                    <p className="font-body text-sm text-[#0D0D0D]">{ville}</p>
                    <p className="font-body text-sm text-[#6B6560] text-right">{data.count}</p>
                    <p className="font-body text-sm font-500 text-[#0D0D0D] text-right">{formatEur(data.prix_moyen)}</p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Performance agences */}
        {agences.length > 0 && (
          <div>
            <p className="font-body text-[10px] tracking-[0.2em] uppercase text-[#6B6560] mb-6">Performance par agence</p>
            <div className="border border-[#D9D4CC] overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F5F0E8] border-b border-[#D9D4CC]">
                    <th className="text-left px-6 py-4 font-body text-[10px] tracking-[0.15em] uppercase text-[#6B6560] font-normal">Agence</th>
                    <th className="text-left px-6 py-4 font-body text-[10px] tracking-[0.15em] uppercase text-[#6B6560] font-normal">Ville</th>
                    <th className="text-right px-6 py-4 font-body text-[10px] tracking-[0.15em] uppercase text-[#6B6560] font-normal">Biens</th>
                    <th className="text-right px-6 py-4 font-body text-[10px] tracking-[0.15em] uppercase text-[#6B6560] font-normal">Ventes</th>
                    <th className="text-right px-6 py-4 font-body text-[10px] tracking-[0.15em] uppercase text-[#6B6560] font-normal">CA</th>
                  </tr>
                </thead>
                <tbody>
                  {agences.map((a) => (
                    <tr key={a.id} className="border-b border-[#D9D4CC] last:border-b-0">
                      <td className="px-6 py-4 font-body text-sm font-500 text-[#0D0D0D]">{a.nom}</td>
                      <td className="px-6 py-4 font-body text-sm text-[#6B6560]">{a.ville}</td>
                      <td className="px-6 py-4 font-body text-sm text-[#6B6560] text-right">{a.nb_biens}</td>
                      <td className="px-6 py-4 font-body text-sm text-[#6B6560] text-right">{a.nb_ventes}</td>
                      <td className="px-6 py-4 font-body text-sm font-500 text-[#0D0D0D] text-right">{formatEur(a.chiffre_affaires)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
