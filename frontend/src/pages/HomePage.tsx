import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <main>
      {/* Hero éditorial */}
      <section className="bg-[#F5F0E8] border-b border-[#D9D4CC]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-36">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="font-body text-xs tracking-[0.2em] uppercase text-[#B8962E] mb-6">
                Groupe immobilier — Depuis 2005
              </p>
              <h1 className="font-display text-5xl lg:text-7xl text-[#0D0D0D] leading-tight mb-8">
                L'excellence<br />
                <em className="font-light italic">au service</em><br />
                de votre bien
              </h1>
              <p className="font-body text-sm font-300 text-[#6B6560] leading-relaxed max-w-sm mb-12">
                Ymmo accompagne ses clients dans l'acquisition et la cession
                de biens d'exception à travers toute la France.
                13 agences, une seule exigence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/biens" className="btn-primary">
                  Découvrir les biens
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link to="/agences" className="btn-secondary">
                  Nos agences
                </Link>
              </div>
            </div>

            {/* Bloc éditorial droite */}
            <div className="hidden lg:block">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0D0D0D] aspect-[3/4] flex items-end p-6">
                  <div>
                    <p className="font-display text-4xl text-white">13</p>
                    <p className="font-body text-xs tracking-widest uppercase text-[#D4AF6A] mt-1">agences</p>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&h=600&fit=crop"
                      alt="Bien immobilier"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="bg-[#F5F0E8] border border-[#D9D4CC] flex items-end p-5 flex-1">
                    <div>
                      <p className="font-display text-3xl text-[#0D0D0D]">+500</p>
                      <p className="font-body text-xs tracking-widest uppercase text-[#6B6560] mt-1">biens vendus</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bande chiffres */}
      <section className="bg-[#0D0D0D] py-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center lg:text-left divide-y lg:divide-y-0 lg:divide-x divide-white/10">
            {[
              { n: "13", label: "Agences en France" },
              { n: "500+", label: "Biens vendus" },
              { n: "20 ans", label: "D'expertise" },
              { n: "98%", label: "Clients satisfaits" },
            ].map((stat) => (
              <div key={stat.label} className="py-4 lg:py-0 lg:px-10 first:lg:pl-0 last:lg:pr-0">
                <p className="font-display text-3xl lg:text-4xl text-white">{stat.n}</p>
                <p className="font-body text-xs tracking-widest uppercase text-[#D4AF6A] mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section éditoriale */}
      <section className="py-20 lg:py-32 border-b border-[#D9D4CC]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-3 gap-0 border border-[#D9D4CC]">
            {[
              {
                label: "Résidentiel",
                desc: "Appartements, maisons et villas soigneusement sélectionnés dans les meilleures adresses.",
                cta: "Voir les biens résidentiels",
                filter: "Appartement",
              },
              {
                label: "Professionnel",
                desc: "Bureaux, locaux commerciaux et espaces professionnels dans les quartiers d'affaires.",
                cta: "Voir les biens professionnels",
                filter: "Bureau",
              },
              {
                label: "Prestige",
                desc: "Une sélection exclusive de propriétés d'exception pour une clientèle exigeante.",
                cta: "Voir les biens prestige",
                filter: "Maison",
              },
            ].map((cat, i) => (
              <div
                key={cat.label}
                className={`p-10 lg:p-12 ${i < 2 ? "border-b lg:border-b-0 lg:border-r" : ""} border-[#D9D4CC]`}
              >
                <p className="font-body text-xs tracking-[0.2em] uppercase text-[#B8962E] mb-6">0{i + 1}</p>
                <h3 className="font-display text-3xl text-[#0D0D0D] mb-4">{cat.label}</h3>
                <p className="font-body text-sm font-300 text-[#6B6560] leading-relaxed mb-8">{cat.desc}</p>
                <Link
                  to={`/biens?type=${cat.filter}`}
                  className="link-underline link-underline-gold font-body text-xs tracking-widest uppercase text-[#B8962E] font-500"
                >
                  {cat.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer minimaliste */}
      <footer className="bg-[#F5F0E8] py-12 border-t border-[#D9D4CC]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <span className="font-display text-xl tracking-[0.12em] uppercase text-[#0D0D0D]">Ymmo</span>
          <p className="font-body text-xs text-[#6B6560] tracking-wide">
            © 2025 Ymmo. Groupe immobilier français.
          </p>
          <div className="flex gap-8">
            <Link to="/biens" className="link-underline font-body text-xs tracking-widest uppercase text-[#6B6560]">Biens</Link>
            <Link to="/agences" className="link-underline font-body text-xs tracking-widest uppercase text-[#6B6560]">Agences</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
