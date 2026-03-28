import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import type { Bien } from "../api/types";

interface Props {
  bien: Bien;
  score?: number;
}

const TYPE_LABELS: Record<string, string> = {
  Appartement: "Appartement",
  Maison: "Maison",
  Terrain: "Terrain",
  Local: "Local",
  Bureau: "Bureau",
};

export default function BienCard({ bien, score }: Props) {
  const formatPrix = (prix: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(prix);

  const photoPrincipale = bien.photos.find((p) => p.estPrincipale) ?? bien.photos[0];

  return (
    <Link
      to={`/biens/${bien.id}`}
      className="group block border border-[#D9D4CC] hover:border-[#0D0D0D] transition-colors duration-300"
    >
      {/* Image */}
      <div className={`aspect-[4/3] bg-[#F5F0E8] overflow-hidden relative ${bien.statut === "Vendu" ? "after:absolute after:inset-0 after:bg-black/20" : ""}`}>
        {photoPrincipale ? (
          <img
            src={photoPrincipale.url}
            alt={bien.titre}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-display text-5xl text-[#D9D4CC]">Y</span>
          </div>
        )}
        {/* Badge type */}
        <span className="absolute top-4 left-4 bg-white border border-[#D9D4CC] font-body text-[10px] tracking-[0.15em] uppercase text-[#6B6560] px-3 py-1">
          {TYPE_LABELS[bien.type] ?? bien.type}
        </span>
        {/* Statut badge */}
        {bien.statut === "Vendu" && (
          <span className="absolute bottom-4 left-4 bg-[#0D0D0D] font-body text-[10px] tracking-[0.15em] uppercase text-white px-3 py-1">
            Vendu
          </span>
        )}
        {bien.statut === "SousCompromis" && (
          <span className="absolute bottom-4 left-4 bg-[#B8962E] font-body text-[10px] tracking-[0.15em] uppercase text-white px-3 py-1">
            Sous compromis
          </span>
        )}
        {/* Score badge */}
        {score != null && (
          <span className="absolute top-4 right-4 bg-[#0D0D0D] font-body text-[10px] tracking-wide text-[#D4AF6A] px-2.5 py-1">
            {score}/10
          </span>
        )}
      </div>

      {/* Infos */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-display text-xl text-[#0D0D0D] leading-tight truncate">{bien.titre}</p>
            <p className="font-body text-xs text-[#6B6560] tracking-wide mt-1">
              {bien.ville} · {bien.codePostal}
            </p>
          </div>
          <ArrowUpRight
            className="h-4 w-4 text-[#D9D4CC] group-hover:text-[#0D0D0D] shrink-0 transition-colors duration-300 mt-1"
          />
        </div>

        {/* Séparateur */}
        <div className="border-t border-[#D9D4CC] mt-5 pt-5 flex items-center justify-between">
          <p className="font-display text-2xl text-[#0D0D0D]">{formatPrix(bien.prix)}</p>
          <div className="flex items-center gap-4 font-body text-xs text-[#6B6560] tracking-wide">
            <span>{bien.surface} m²</span>
            <span className="text-[#D9D4CC]">·</span>
            <span>{bien.nbPieces} p.</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
