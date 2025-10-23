import { useState, useEffect, useCallback } from "react";
import api from "../../services/api";

/*
  Nota (como eu faria):
  - Este hook chama GET /api/projects/:id/issues e espera { issues: [...] }.
  - Se a estrutura for diferente (ex.: `data.problems`), faço o mapping aqui antes
    de setar `issues`.
  - Recomendo que cada issue tenha pelo menos: { id, path, problems: string[] }
    para eu renderizar os cards sem tratamentos adicionais no componente.
  - Trato erros aqui e exponho `error` para o componente decidir mostrar retry/message.
*/

export function useProjectIssues(projectId) {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchIssues = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await api.get(`/api/projects/${projectId}/issues`);
      setIssues(resp.data && resp.data.issues ? resp.data.issues : []);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  return { issues, loading, error, reload: fetchIssues };
}
