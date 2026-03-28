import { useEffect, useState } from "react";
import { Shield, UserCheck, Building2 } from "lucide-react";
import api from "../../api/client";
import type { Agence } from "../../api/types";

interface UserRow {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  role: string;
  agenceId?: number;
  agenceNom?: string;
  dateCreation: string;
}

const ROLE_LABELS: Record<string, string> = {
  Client: "Client",
  Agent: "Agent",
  AdminAgence: "Admin Agence",
  AdminSiege: "Admin Siège",
};

const ROLE_COLORS: Record<string, string> = {
  Client: "bg-[#F5F0E8] text-[#6B6560]",
  Agent: "bg-[#0D0D0D] text-[#D4AF6A]",
  AdminAgence: "bg-[#B8962E] text-white",
  AdminSiege: "bg-[#0D0D0D] text-white",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [agences, setAgences] = useState<Agence[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRole, setEditRole] = useState("");
  const [editAgenceId, setEditAgenceId] = useState<number | undefined>();
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    Promise.all([
      api.get("/utilisateurs/all"),
      api.get("/agences"),
    ]).then(([u, a]) => {
      setUsers(u.data);
      setAgences(a.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const startEdit = (u: UserRow) => {
    setEditingId(u.id);
    setEditRole(u.role);
    setEditAgenceId(u.agenceId ?? undefined);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditRole("");
    setEditAgenceId(undefined);
  };

  const saveRole = async (userId: number) => {
    setSaving(true);
    try {
      const body: any = { role: editRole };
      if (editRole === "Agent" || editRole === "AdminAgence") {
        body.agenceId = editAgenceId;
      }
      const res = await api.put(`/utilisateurs/${userId}/role`, body);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, role: res.data.role, agenceId: res.data.agenceId, agenceNom: res.data.agenceNom }
            : u
        )
      );
      setEditingId(null);
    } catch (err: any) {
      alert(err.response?.data?.message ?? "Erreur");
    } finally {
      setSaving(false);
    }
  };

  const filtered = filter === "all" ? users : users.filter((u) => u.role === filter);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-6 h-6 border border-[#0D0D0D] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <p className="font-body text-xs tracking-[0.2em] uppercase text-[#B8962E] mb-2">Administration</p>
      <h1 className="font-display text-3xl text-[#0D0D0D] mb-2">Gestion des utilisateurs</h1>
      <p className="font-body text-sm text-[#6B6560] mb-8">
        Promouvoir des clients en agents et les assigner à des agences.
      </p>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: "all", label: "Tous", count: users.length },
          { key: "Client", label: "Clients", count: users.filter((u) => u.role === "Client").length },
          { key: "Agent", label: "Agents", count: users.filter((u) => u.role === "Agent").length },
          { key: "AdminAgence", label: "Admins Agence", count: users.filter((u) => u.role === "AdminAgence").length },
          { key: "AdminSiege", label: "Admins Siège", count: users.filter((u) => u.role === "AdminSiege").length },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`font-body text-xs tracking-[0.1em] uppercase px-4 py-2 border transition-colors ${
              filter === f.key
                ? "bg-[#0D0D0D] text-white border-[#0D0D0D]"
                : "bg-white text-[#6B6560] border-[#D9D4CC] hover:border-[#0D0D0D]"
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="border border-[#D9D4CC] overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#F5F0E8] border-b border-[#D9D4CC]">
              {["Utilisateur", "Email", "Rôle", "Agence", "Inscrit le", "Actions"].map((h) => (
                <th key={h} className="text-left px-5 py-3.5 font-body text-[10px] tracking-[0.15em] uppercase text-[#6B6560] font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-[#D9D4CC] last:border-b-0">
                <td className="px-5 py-3.5">
                  <p className="font-body text-sm font-500 text-[#0D0D0D]">{u.prenom} {u.nom}</p>
                  {u.telephone && <p className="font-body text-xs text-[#6B6560]">{u.telephone}</p>}
                </td>
                <td className="px-5 py-3.5 font-body text-sm text-[#6B6560]">{u.email}</td>
                <td className="px-5 py-3.5">
                  {editingId === u.id ? (
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      className="font-body text-xs border border-[#D9D4CC] px-2 py-1.5 bg-white focus:outline-none focus:border-[#0D0D0D]"
                    >
                      <option value="Client">Client</option>
                      <option value="Agent">Agent</option>
                      <option value="AdminAgence">Admin Agence</option>
                      <option value="AdminSiege">Admin Siège</option>
                    </select>
                  ) : (
                    <span className={`inline-block font-body text-[10px] tracking-[0.1em] uppercase px-2.5 py-1 ${ROLE_COLORS[u.role] ?? "bg-gray-100"}`}>
                      {ROLE_LABELS[u.role] ?? u.role}
                    </span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  {editingId === u.id && (editRole === "Agent" || editRole === "AdminAgence") ? (
                    <select
                      value={editAgenceId ?? ""}
                      onChange={(e) => setEditAgenceId(e.target.value ? parseInt(e.target.value) : undefined)}
                      className="font-body text-xs border border-[#D9D4CC] px-2 py-1.5 bg-white focus:outline-none focus:border-[#0D0D0D]"
                    >
                      <option value="">Choisir...</option>
                      {agences.map((a) => (
                        <option key={a.id} value={a.id}>{a.nom}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="font-body text-sm text-[#6B6560]">
                      {u.agenceNom ? (
                        <span className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5" />
                          {u.agenceNom}
                        </span>
                      ) : "—"}
                    </span>
                  )}
                </td>
                <td className="px-5 py-3.5 font-body text-sm text-[#6B6560]">
                  {new Date(u.dateCreation).toLocaleDateString("fr-FR")}
                </td>
                <td className="px-5 py-3.5">
                  {editingId === u.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveRole(u.id)}
                        disabled={saving}
                        className="font-body text-[10px] tracking-[0.1em] uppercase px-3 py-1.5 bg-[#0D0D0D] text-white hover:bg-[#1A1A1A] transition-colors disabled:opacity-50"
                      >
                        {saving ? "..." : "Valider"}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="font-body text-[10px] tracking-[0.1em] uppercase px-3 py-1.5 border border-[#D9D4CC] text-[#6B6560] hover:border-[#0D0D0D] transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEdit(u)}
                      className="group flex items-center gap-1.5 font-body text-[10px] tracking-[0.1em] uppercase text-[#6B6560] hover:text-[#0D0D0D] transition-colors"
                    >
                      <Shield className="h-3.5 w-3.5" />
                      Modifier
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <p className="font-body text-sm text-[#6B6560] py-12 text-center">Aucun utilisateur dans cette catégorie.</p>
      )}
    </div>
  );
}
