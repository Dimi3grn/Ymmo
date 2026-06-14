import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X } from "lucide-react";
import api from "../api/client";
import type { Bien } from "../api/types";
import BienCard from "../components/BienCard";

const TYPES = ["Appartement", "Maison", "Terrain", "Local", "Bureau"];

export default function BiensPage() {
  const [searchParams] = useSearchParams();
  const [biens, setBiens] = useState<Bien[]>([]);
  const [scores, setScores] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [ville, setVille] = useState("");
  const [type, setType] = useState(searchParams.get("type") ?? "");
  const [statut, setStatut] = useState("tous");
  const [prixMin, setPrixMin] = useState("");
  const [prixMax, setPrixMax] = useState("");
  const [nbPiecesMin, setNbPiecesMin] = useState("");

  const fetchBiens = async () => {
    setLoading(true);
    setError(false);
    try {
      const params: Record<string, string> = {};
      if (ville) params.ville = ville;
      if (type) params.type = type;
      if (statut && statut !== "tous") params.statut = statut;
      if (prixMin) params.prixMin = prixMin;
      if (prixMax) params.prixMax = prixMax;
      if (nbPiecesMin) params.nbPiecesMin = nbPiecesMin;

      const res = await api.get("/biens", { params });
      setBiens(res.data);
    } catch (err) {
      console.error(err);
      setBiens([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBiens();
    api.get("/scores/biens")
      .then((r) => {
        const map: Record<number, number> = {};
        for (const b of r.data.biens ?? []) map[b.bien_id] = b.score_total;
        setScores(map);
      })
      .catch(() => {});
    // Chargement initial uniquement ; les filtres se rejouent via le formulaire.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBiens();
    setFiltersOpen(false);
  };

  const resetFilters = () => {
    setVille(""); setType(""); setStatut("tous"); setPrixMin(""); setPrixMax(""); setNbPiecesMin("");
  };

  const hasFilters = ville || type || (statut && statut !== "tous") || prixMin || prixMax || nbPiecesMin;

  return (
    <div className="min-h-screen">
      {/* En-tête */}
      <div className="bg-[#F5F0E8] border-b border-[#D9D4CC] px-4 sm:px-6 lg:px-12 py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto">
          <p className="font-body text-xs tracking-[0.2em] uppercase text-[#B8962E] mb-3">
            Notre sélection
          </p>
          <h1 className="font-display text-4xl lg:text-5xl text-[#0D0D0D]">
            Biens immobiliers
          </h1>
          {!loading && (
            <p className="font-body text-sm text-[#6B6560] mt-3 tracking-wide">
              {biens.length} bien{biens.length > 1 ? "s" : ""} disponible{biens.length > 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-10 lg:py-16">
        <div className="flex gap-8 lg:gap-12">

          {/* Filtres latéraux desktop */}
          <aside className="hidden lg:block w-56 shrink-0">
            <form onSubmit={handleSearch}>
              <div className="flex items-center justify-between mb-8">
                <p className="font-body text-xs tracking-[0.15em] uppercase text-[#0D0D0D] font-500">Filtres</p>
                {hasFilters && (
                  <button type="button" onClick={resetFilters} className="font-body text-[10px] tracking-widest uppercase text-[#6B6560] hover:text-[#0D0D0D] transition-colors">
                    Effacer
                  </button>
                )}
              </div>

              <div className="space-y-8">
                <div>
                  <label className="font-body text-[10px] tracking-[0.15em] uppercase text-[#6B6560] block mb-3">Ville</label>
                  <input
                    type="text"
                    value={ville}
                    onChange={(e) => setVille(e.target.value)}
                    placeholder="Paris, Lyon…"
                    className="input-field text-sm"
                  />
                </div>

                <div>
                  <label className="font-body text-[10px] tracking-[0.15em] uppercase text-[#6B6560] block mb-3">Type</label>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => setType("")}
                      className={`text-left font-body text-xs tracking-wide py-1 border-b transition-colors ${!type ? "border-[#0D0D0D] text-[#0D0D0D] font-500" : "border-transparent text-[#6B6560] hover:text-[#0D0D0D]"}`}
                    >
                      Tous
                    </button>
                    {TYPES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        className={`text-left font-body text-xs tracking-wide py-1 border-b transition-colors ${type === t ? "border-[#0D0D0D] text-[#0D0D0D] font-500" : "border-transparent text-[#6B6560] hover:text-[#0D0D0D]"}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-body text-[10px] tracking-[0.15em] uppercase text-[#6B6560] block mb-3">Statut</label>
                  <div className="flex flex-col gap-2">
                    {[
                      { key: "tous", label: "Tous" },
                      { key: "Disponible", label: "Disponible" },
                      { key: "SousCompromis", label: "Sous compromis" },
                      { key: "Vendu", label: "Vendu" },
                    ].map((s) => (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => setStatut(s.key)}
                        className={`text-left font-body text-xs tracking-wide py-1 border-b transition-colors ${statut === s.key ? "border-[#0D0D0D] text-[#0D0D0D] font-500" : "border-transparent text-[#6B6560] hover:text-[#0D0D0D]"}`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-body text-[10px] tracking-[0.15em] uppercase text-[#6B6560] block mb-3">Budget</label>
                  <input
                    type="number"
                    value={prixMin}
                    onChange={(e) => setPrixMin(e.target.value)}
                    placeholder="Min €"
                    className="input-field text-sm mb-4"
                  />
                  <input
                    type="number"
                    value={prixMax}
                    onChange={(e) => setPrixMax(e.target.value)}
                    placeholder="Max €"
                    className="input-field text-sm"
                  />
                </div>

                <div>
                  <label className="font-body text-[10px] tracking-[0.15em] uppercase text-[#6B6560] block mb-3">Pièces min.</label>
                  <div className="flex gap-2">
                    {["", "1", "2", "3", "4", "5"].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setNbPiecesMin(n)}
                        className={`w-8 h-8 font-body text-xs border transition-colors ${nbPiecesMin === n ? "border-[#0D0D0D] bg-[#0D0D0D] text-white" : "border-[#D9D4CC] text-[#6B6560] hover:border-[#0D0D0D]"}`}
                      >
                        {n || "T"}
                      </button>
                    ))}
                  </div>
                </div>

                <button type="submit" className="btn-primary w-full justify-center text-xs">
                  <Search className="h-3 w-3" />
                  Rechercher
                </button>
              </div>
            </form>
          </aside>

          {/* Contenu principal */}
          <div className="flex-1 min-w-0">
            {/* Barre mobile */}
            <div className="lg:hidden flex items-center justify-between mb-6">
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="flex items-center gap-2 font-body text-xs tracking-widest uppercase text-[#0D0D0D] border border-[#D9D4CC] px-4 py-2.5"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filtres {hasFilters && `(actifs)`}
              </button>
            </div>

            {/* Filtres mobile overlay */}
            {filtersOpen && (
              <div className="lg:hidden fixed inset-0 z-40 bg-white overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-8">
                    <p className="font-body text-sm tracking-[0.15em] uppercase font-500">Filtres</p>
                    <button onClick={() => setFiltersOpen(false)}>
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <form onSubmit={handleSearch} className="space-y-8">
                    <div>
                      <label className="font-body text-[10px] tracking-[0.15em] uppercase text-[#6B6560] block mb-3">Ville</label>
                      <input type="text" value={ville} onChange={(e) => setVille(e.target.value)} placeholder="Paris, Lyon…" className="input-field" />
                    </div>
                    <div>
                      <label className="font-body text-[10px] tracking-[0.15em] uppercase text-[#6B6560] block mb-3">Budget max</label>
                      <input type="number" value={prixMax} onChange={(e) => setPrixMax(e.target.value)} placeholder="Max €" className="input-field" />
                    </div>
                    <button type="submit" className="btn-primary w-full justify-center">Appliquer</button>
                  </form>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-32">
                <div className="w-6 h-6 border border-[#0D0D0D] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="py-32 text-center">
                <p className="font-display text-3xl text-[#0D0D0D] mb-3">Service indisponible</p>
                <p className="font-body text-sm text-[#6B6560] mb-6">
                  Impossible de charger les biens pour le moment.
                </p>
                <button onClick={() => fetchBiens()} className="btn-primary text-xs">
                  Réessayer
                </button>
              </div>
            ) : biens.length === 0 ? (
              <div className="py-32 text-center">
                <p className="font-display text-3xl text-[#0D0D0D] mb-3">Aucun résultat</p>
                <p className="font-body text-sm text-[#6B6560]">Modifiez vos critères de recherche.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {biens.map((bien) => (
                  <BienCard key={bien.id} bien={bien} score={scores[bien.id]} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
