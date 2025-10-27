export function buildTreeFromPaths(input = []) {
  const items = input.map((it) => {
    if (!it) return null;
    if (typeof it === 'string') return { path: it };
    if (typeof it === 'object') return { path: it.path || it.name || '', type: it.type, meta: it.meta };
    return null;
  }).filter(Boolean);

  const nodesByPath = new Map();

  for (const it of items) {
    const raw = (it.path || '').replace(/^\/+/, '');
    if (!raw) continue;
    const parts = raw.split('/').filter(Boolean);
    for (let i = 0; i < parts.length; i++) {
      const seg = parts[i];
      const parentPath = parts.slice(0, i).join('/');
      const curPath = parentPath ? parentPath + '/' + seg : seg;
      if (!nodesByPath.has(curPath)) {
        const isLeaf = i === parts.length - 1;
        const type = isLeaf ? (it.type === 'tree' || it.type === 'folder' ? 'folder' : 'file') : 'folder';
        nodesByPath.set(curPath, { name: seg, path: curPath, type, children: [], meta: isLeaf ? (it.meta || undefined) : undefined });
      }
    }
  }

  for (const [p, node] of nodesByPath.entries()) {
    const parentPath = p.includes('/') ? p.slice(0, p.lastIndexOf('/')) : null;
    if (parentPath) {
      const parent = nodesByPath.get(parentPath);
      if (parent) parent.children.push(node);
    }
  }

  const roots = [];
  for (const [p, node] of nodesByPath.entries()) {
    const parentPath = p.includes('/') ? p.slice(0, p.lastIndexOf('/')) : null;
    if (!parentPath) roots.push(node);
  }

  const sortRecursive = (n) => {
    if (!n.children || n.children.length === 0) return;
    n.children.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    n.children.forEach(sortRecursive);
  };
  // sort root nodes too: folders first, then files, alphabetical
  roots.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  roots.forEach(sortRecursive);

  return roots;
}

function normalizePath(p = '') {
  return (p || '').replace(/^\.?\/+/, '').trim();
}

/**
 * Constrói uma árvore completa a partir de treeEntries e anexa docs às folhas
 */
export function buildTreeWithDocs(treeEntries = [], docs = []) {
  const docsMap = new Map();
  const docsMapLower = new Map();
  for (const d of docs || []) {
    const p = normalizePath(d.path || d.name || '');
    if (!p) continue;
    docsMap.set(p, d);
    docsMapLower.set(p.toLowerCase(), d);
  }

  const items = Array.isArray(treeEntries) && treeEntries.length
    ? treeEntries.map(e => ({ path: normalizePath(e.path), type: e.type }))
    : (docs || []).map(d => ({ path: normalizePath(d.path || d.name || ''), type: 'blob' }));

  const roots = buildTreeFromPaths(items);

  function attachDocs(node) {
    if (!node) return;
    if (node.children && node.children.length > 0) {
      node.children.forEach(attachDocs);
      return;
    }
    const p = normalizePath(node.path || '');
    if (!p) return;
    let doc = docsMap.get(p);
    if (!doc) doc = docsMapLower.get(p.toLowerCase());
    if (doc) {
      node.meta = node.meta || {};
      node.meta.doc = doc;
    }
  }

  roots.forEach(attachDocs);
  return roots;
}
