import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';

const ReposContext = createContext({
  reposByOwner: {},
  setReposForOwner: () => {},
});

export function ReposProvider({ children }) {
  const [reposByOwner, setReposByOwner] = useState(() => {
    try {
      const raw = sessionStorage.getItem('reposByOwner');
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem('reposByOwner', JSON.stringify(reposByOwner));
    } catch (e) {
      // ignore
    }
  }, [reposByOwner]);

  const setReposForOwner = useCallback((owner, nextValue) => {
    setReposByOwner(prev => {
      const previousRepos = prev[owner] ?? [];
      const resolved = typeof nextValue === 'function' ? nextValue(previousRepos) : nextValue;
      return { ...prev, [owner]: resolved };
    });
  }, [setReposByOwner]);

  const contextValue = useMemo(() => ({
    reposByOwner,
    setReposForOwner,
  }), [reposByOwner, setReposForOwner]);

  return (
    <ReposContext.Provider value={contextValue}>
      {children}
    </ReposContext.Provider>
  );
}

export default ReposContext;
