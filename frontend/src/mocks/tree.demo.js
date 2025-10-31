const demoTree = [
  {
    type: "folder",
    name: "src",
    children: [
      {
        type: "folder",
        name: "components",
        children: [
          { type: "file", name: "Button.tsx", meta: { badge: "100%" } },
          { type: "file", name: "Card.tsx", meta: { badge: "95%" } },
          { type: "file", name: "Modal.tsx", meta: { badge: "30%" } },
          {
            type: "folder",
            name: "Forms",
            children: [
              { type: "file", name: "LoginForm.tsx", meta: { badge: "60%" } },
              {
                type: "file",
                name: "RegisterForm.tsx",
                meta: { badge: "45%" },
              },
            ],
          },
        ],
      },
      {
        type: "folder",
        name: "pages",
        children: [
          { type: "file", name: "Home.jsx", meta: { badge: "100%" } },
          { type: "file", name: "Login.jsx", meta: { badge: "80%" } },
          { type: "file", name: "Analysis.jsx", meta: { badge: "70%" } },
        ],
      },
      {
        type: "folder",
        name: "utils",
        children: [
          { type: "file", name: "api.js", meta: { badge: "90%" } },
          { type: "file", name: "format.js", meta: { badge: "100%" } },
        ],
      },
    ],
  },
  {
    type: "folder",
    name: "public",
    children: [{ type: "file", name: "index.html", meta: { badge: "100%" } }],
  },
  {
    type: "folder",
    name: "docs",
    children: [
      { type: "file", name: "README.md", meta: { badge: "75%" } },
      { type: "file", name: "requisitos.md", meta: { badge: "50%" } },
    ],
  },
];

export default demoTree;
