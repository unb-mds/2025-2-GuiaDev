import { useState, useEffect, useCallback } from "react";
import api from "../../services/api";

/*
  Nota (como eu faria):
  - Este hook espera GET /api/projects/:id/summary retornando { summary: [...] }.
  - Se o backend devolver a lista em outro campo, adapto aqui (resp.data.something).
  - Posso normalizar campos aqui para que o componente receba sempre o mesmo formato.
*/

export function useSummary(projectId) {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSummary = useCallback(async () => {
    if (!projectId) {
      setSummary([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await api.get(`/api/projects/${projectId}/summary`);
      setSummary(resp.data && resp.data.summary ? resp.data.summary : []);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, loading, error, reload: fetchSummary };
}
