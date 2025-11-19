import React, { createContext, useState, useEffect } from 'react';

const ReposContext = createContext({
  reposByOwner: {},
  getReposForOwner: () => null,
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

  const setReposForOwner = (owner, repos) => {
    setReposByOwner(prev => ({ ...prev, [owner]: repos }));
  };

  const getReposForOwner = (owner) => reposByOwner[owner] ?? null;

  return (
    <ReposContext.Provider value={{ reposByOwner, getReposForOwner, setReposForOwner }}>
      {children}
    </ReposContext.Provider>
  );
}

export default ReposContext;
