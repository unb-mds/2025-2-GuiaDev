import { useState, useEffect, useCallback } from "react";
import api from "../../services/api";

/*
  Nota (como eu faria):
  - Este hook espera que meu backend exponha um endpoint GET /api/projects/:id/metrics
    que retorna { metrics: [...] }.
  - Se o backend usar outro caminho, mudo a URL abaixo (api.get(...)).
  - Se a resposta do backend usar campos diferentes (ex.: `data.items` em vez de `data.metrics`),
    faço o mapping aqui, por exemplo:
      const resp = await api.get('/meu/caminho');
      const items = resp.data && resp.data.items ? resp.data.items : [];
      setMetrics(items.map(m => ({ id: m.id, name: m.title, value: m.value })));
  - Auth já é tratado por `frontend/services/api.js` (pega token do localStorage). Se eu usar outro
    header, ajusto o interceptor em `services/api.js`.
*/

export function useMetrics(projectId) {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMetrics = useCallback(async () => {
    if (!projectId) {
      setMetrics([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await api.get(`/api/projects/${projectId}/metrics`);
      setMetrics(resp.data && resp.data.metrics ? resp.data.metrics : []);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return { metrics, loading, error, reload: fetchMetrics };
}
