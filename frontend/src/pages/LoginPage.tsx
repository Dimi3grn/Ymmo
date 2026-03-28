import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = isRegister ? "/auth/register" : "/auth/login";
      const body = isRegister
        ? { nom, prenom, email, motDePasse: password, telephone: telephone || undefined }
        : { email, motDePasse: password };

      const res = await api.post(endpoint, body);
      login(res.data.token, res.data.utilisateur);
      const role = res.data.utilisateur.role;
      if (["Agent", "AdminAgence", "AdminSiege"].includes(role)) navigate("/agent");
      else navigate("/mon-espace");
    } catch (err: any) {
      setError(err.response?.data?.message ?? "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex">
      {/* Panneau gauche décoratif */}
      <div className="hidden lg:flex flex-col justify-between bg-[#0D0D0D] w-2/5 p-16">
        <span className="font-display text-2xl tracking-[0.12em] uppercase text-white">Ymmo</span>
        <div>
          <p className="font-display text-4xl text-white leading-snug italic mb-6">
            "L'immobilier,<br />c'est avant tout<br />une histoire de confiance."
          </p>
          <p className="font-body text-xs tracking-widest uppercase text-[#D4AF6A]">Groupe Ymmo</p>
        </div>
        <p className="font-body text-xs text-white/30 tracking-wide">© 2025 Ymmo</p>
      </div>

      {/* Formulaire */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 bg-white">
        <div className="w-full max-w-sm">
          <p className="font-body text-xs tracking-[0.2em] uppercase text-[#B8962E] mb-4">
            {isRegister ? "Nouveau compte" : "Espace client"}
          </p>
          <h1 className="font-display text-4xl text-[#0D0D0D] mb-10">
            {isRegister ? "Inscription" : "Connexion"}
          </h1>

          {error && (
            <div className="border border-red-200 bg-red-50 text-red-700 font-body text-xs px-4 py-3 mb-8 tracking-wide">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {isRegister && (
              <>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="font-body text-[10px] tracking-[0.15em] uppercase text-[#6B6560] block mb-2">Nom</label>
                    <input required value={nom} onChange={(e) => setNom(e.target.value)} className="input-field" />
                  </div>
                  <div>
                    <label className="font-body text-[10px] tracking-[0.15em] uppercase text-[#6B6560] block mb-2">Prénom</label>
                    <input required value={prenom} onChange={(e) => setPrenom(e.target.value)} className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="font-body text-[10px] tracking-[0.15em] uppercase text-[#6B6560] block mb-2">Téléphone</label>
                  <input type="tel" value={telephone} onChange={(e) => setTelephone(e.target.value)} className="input-field" />
                </div>
              </>
            )}

            <div>
              <label className="font-body text-[10px] tracking-[0.15em] uppercase text-[#6B6560] block mb-2">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
            </div>

            <div>
              <label className="font-body text-[10px] tracking-[0.15em] uppercase text-[#6B6560] block mb-2">Mot de passe</label>
              <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-4 disabled:opacity-40">
              {loading ? "Chargement…" : isRegister ? "Créer mon compte" : "Se connecter"}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-[#D9D4CC]">
            <p className="font-body text-xs text-[#6B6560] tracking-wide text-center">
              {isRegister ? "Déjà un compte ?" : "Pas encore de compte ?"}{" "}
              <button
                onClick={() => { setIsRegister(!isRegister); setError(""); }}
                className="link-underline text-[#0D0D0D] font-500"
              >
                {isRegister ? "Se connecter" : "S'inscrire"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
