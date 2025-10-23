import { useState, useEffect, useCallback } from "react";
import api from "../../services/api";

/*
  Nota (como eu faria):
  - Este hook usa GET /api/projects/:id/repos -> { repos: [...] }.
 
  - Se a API retornar outro formato (ex.: data.items), faço o mapping e retorno sempre um array de repos.
*/

export function useRepos(projectId) {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRepos = useCallback(async () => {
    if (!projectId) {
      setRepos([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await api.get(`/api/projects/${projectId}/repos`);
      setRepos(resp.data && resp.data.repos ? resp.data.repos : []);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  return { repos, loading, error, reload: fetchRepos };
}
