import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import "./Config.css";

export default function ConfigComponent({ onClose }) {
    const [email, setEmail] = useState("");
    const [usernameGit, setUsernameGit] = useState("");
    const [senha, setSenha] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // GET inicial
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);

                const res = await api.get('/auth/profile');
               
                const payload = res.data?.user ?? res.data ?? {};
                if (!mounted) return;
                setEmail(payload?.email || "");
                setUsernameGit(payload?.usernameGit || payload?.username || "");
                setError(null);
            } catch (e) {
                if (mounted) setError(e?.response?.data?.message || e?.message || "Falha ao carregar");
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);


    async function handleSave(e) {
        e.preventDefault();
        try {
            setSaving(true);

            const res = await api.patch("/user/userUpdate", { email, usernameGit, senha});
            
            const updated = res.data?.user ?? res.data ?? {};
            setEmail(updated.email ?? email);
            setUsernameGit(updated.usernameGit ?? updated.username ?? usernameGit);
            setError(null);
            if (typeof window !== "undefined") {
                window.dispatchEvent(new CustomEvent("profileUpdated", {
                    detail: {
                        usernameGit: updated.usernameGit ?? usernameGit,
                        username: updated.username ?? undefined,
                        email: updated.email ?? email,
                    }
                }));
            }
            onClose && onClose();
            
        } catch (e) {
            setError(e?.response?.data?.message || e?.message || "Falha ao salvar");
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <p className="config-loading">Carregando…</p>;

    return (
        <div className="config-content">
            <form onSubmit={handleSave} className="config-form">
                {error && <p className="config-error">{error}</p>}

                <label className="config-label">
                    Username GitHub
                    <input
                        className="config-input"
                        placeholder="usernameGitHub"
                        value={usernameGit}
                        onChange={(e) => setUsernameGit(e.target.value)}
                    />
                </label>

                <label className="config-label">
                    Email
                    <input
                        className="config-input"
                        placeholder="seu@email.com"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </label>

                <label className="config-label">
                    Senha
                    <input
                        className="config-input"
                        placeholder="Altere sua senha!"
                        type="password"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        autoComplete="new-password"
                    />
                </label>

                <div className="config-actions">
                    <button type="button" onClick={onClose} className="btn btn-cancel">
                        Cancelar
                    </button>
                    <button type="submit" disabled={saving} className={`btn btn-save ${saving ? "saving" : ""}`}>
                        {saving ? "Salvando…" : "Salvar"}
                    </button>
                </div>
            </form>
        </div>

    );
}
