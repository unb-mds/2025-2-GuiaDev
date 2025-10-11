import { useState, useEffect, useCallback } from "react";
import api from "../../services/api";

/*
  Nota (como eu faria):
  - Este hook espera que o backend exponha GET /api/projects/:id/tree e retorne
    { tree: [...] }.
  - Se a API usar outro caminho, altero a chamada abaixo (api.get('/meu/caminho')).
  - Se a resposta vier em outro campo (p.ex. resp.data.items), faço o mapping
    aqui antes de setar o estado: setTree(resp.data.items || []).
  - Uso AbortController para cancelar requisições ao desmontar; se sua versão do
    axios não suportar `signal`, troco para o CancelToken do axios.
  - Autenticação / headers já são tratados em `frontend/services/api.js`.
  - Normalização: se eu quiser que o frontend sempre receba `meta.progress` numérico,
    faço o parse aqui para manter o componente simples.
*/

export function useProjectTree(projectId) {
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTree = useCallback(async () => {
    if (!projectId) {
      setTree([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const controller = new AbortController();
      const resp = await api.get(`/api/projects/${projectId}/tree`, {
        signal: controller.signal,
      });
      setTree(resp.data && resp.data.tree ? resp.data.tree : []);
    } catch (e) {
      if (e.name !== "CanceledError" && e.name !== "AbortError") setError(e);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  return { tree, loading, error, reload: fetchTree };
}
