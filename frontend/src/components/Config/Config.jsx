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

                const res = await api.get("/config");
                const data = res.data;
                if (!mounted) return;
                setEmail(data?.email || "");
                setUsernameGit(data?.usernameGit || "");
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

            const res = await api.patch("/config", { email, usernameGit, senha});
            const updated = res.data || {};
            setEmail(updated.email ?? email);
            setUsernameGit(updated.usernameGit ?? usernameGit);
            setError(null);
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
