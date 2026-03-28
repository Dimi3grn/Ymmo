import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/client";
import type { Agence } from "../../api/types";

const TYPES = ["Appartement", "Maison", "Terrain", "Local", "Bureau"];
const DPE = ["A", "B", "C", "D", "E", "F", "G"];

export default function AgentBienFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [agences, setAgences] = useState<Agence[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    titre: "", description: "", type: "Appartement", prix: "", surface: "",
    nbPieces: "1", nbChambres: "0", adresse: "", ville: "", codePostal: "",
    anneeConstruction: "", dpe: "", ascenseur: false, parking: false,
    balcon: false, jardin: false, piscine: false, agenceId: "1",
  });

  useEffect(() => {
    api.get("/agences").then((r) => setAgences(r.data));
    if (isEdit) {
      api.get(`/biens/${id}`).then((r) => {
        const b = r.data;
        setForm({
          titre: b.titre, description: b.description ?? "", type: b.type,
          prix: b.prix.toString(), surface: b.surface.toString(),
          nbPieces: b.nbPieces.toString(), nbChambres: b.nbChambres.toString(),
          adresse: b.adresse, ville: b.ville, codePostal: b.codePostal,
          anneeConstruction: b.anneeConstruction?.toString() ?? "",
          dpe: b.dpe ?? "", ascenseur: b.ascenseur, parking: b.parking,
          balcon: b.balcon, jardin: b.jardin, piscine: b.piscine,
          agenceId: agences.find((a) => a.nom === b.agenceNom)?.id?.toString() ?? "1",
        });
      });
    }
  }, [id]);

  const set = (key: string, val: string | boolean) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const body = {
        ...form,
        prix: parseFloat(form.prix), surface: parseFloat(form.surface),
        nbPieces: parseInt(form.nbPieces), nbChambres: parseInt(form.nbChambres),
        agenceId: parseInt(form.agenceId),
        anneeConstruction: form.anneeConstruction ? parseInt(form.anneeConstruction) : null,
        dpe: form.dpe || null,
      };
      if (isEdit) await api.put(`/biens/${id}`, body);
      else await api.post("/biens", body);
      navigate("/agent/biens");
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Erreur lors de l'enregistrement.");
    } finally { setLoading(false); }
  };

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="font-body text-[10px] tracking-[0.15em] uppercase text-[#6B6560] block mb-2">{label}</label>
      {children}
    </div>
  );

  return (
    <div>
      <p className="font-body text-xs tracking-[0.2em] uppercase text-[#B8962E] mb-2">Gestion</p>
      <h1 className="font-display text-3xl text-[#0D0D0D] mb-10">{isEdit ? "Modifier le bien" : "Ajouter un bien"}</h1>

      {error && <div className="border border-red-200 bg-red-50 text-red-700 font-body text-xs px-4 py-3 mb-8">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
        <Field label="Titre">
          <input required value={form.titre} onChange={(e) => set("titre", e.target.value)} className="input-field" />
        </Field>
        <Field label="Description">
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} className="input-field resize-none" />
        </Field>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          <Field label="Type">
            <select value={form.type} onChange={(e) => set("type", e.target.value)} className="input-field">
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Prix (€)">
            <input type="number" required value={form.prix} onChange={(e) => set("prix", e.target.value)} className="input-field" />
          </Field>
          <Field label="Surface (m²)">
            <input type="number" required value={form.surface} onChange={(e) => set("surface", e.target.value)} className="input-field" />
          </Field>
          <Field label="Pièces">
            <input type="number" required value={form.nbPieces} onChange={(e) => set("nbPieces", e.target.value)} className="input-field" />
          </Field>
          <Field label="Chambres">
            <input type="number" required value={form.nbChambres} onChange={(e) => set("nbChambres", e.target.value)} className="input-field" />
          </Field>
          <Field label="Année construction">
            <input type="number" value={form.anneeConstruction} onChange={(e) => set("anneeConstruction", e.target.value)} className="input-field" />
          </Field>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          <Field label="Adresse">
            <input required value={form.adresse} onChange={(e) => set("adresse", e.target.value)} className="input-field" />
          </Field>
          <Field label="Ville">
            <input required value={form.ville} onChange={(e) => set("ville", e.target.value)} className="input-field" />
          </Field>
          <Field label="Code postal">
            <input required value={form.codePostal} onChange={(e) => set("codePostal", e.target.value)} className="input-field" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Field label="DPE">
            <select value={form.dpe} onChange={(e) => set("dpe", e.target.value)} className="input-field">
              <option value="">—</option>
              {DPE.map((d) => <option key={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="Agence">
            <select value={form.agenceId} onChange={(e) => set("agenceId", e.target.value)} className="input-field">
              {agences.map((a) => <option key={a.id} value={a.id}>{a.nom}</option>)}
            </select>
          </Field>
        </div>

        <div>
          <p className="font-body text-[10px] tracking-[0.15em] uppercase text-[#6B6560] mb-4">Équipements</p>
          <div className="flex flex-wrap gap-3">
            {(["ascenseur", "parking", "balcon", "jardin", "piscine"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => set(key, !form[key])}
                className={`font-body text-xs tracking-wide px-4 py-2 border transition-colors ${form[key] ? "border-[#0D0D0D] bg-[#0D0D0D] text-white" : "border-[#D9D4CC] text-[#6B6560]"}`}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button type="submit" disabled={loading} className="btn-primary disabled:opacity-40">
            {loading ? "Enregistrement…" : isEdit ? "Modifier" : "Ajouter le bien"}
          </button>
          <button type="button" onClick={() => navigate("/agent/biens")} className="btn-secondary">Annuler</button>
        </div>
      </form>
    </div>
  );
}
