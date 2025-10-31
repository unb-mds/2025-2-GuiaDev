import React, { useState } from "react";
import "./Sidebar.css";

const IconDashboard = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z"></path>
  </svg>
);
const IconRepositorios = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM6.24 5h11.52l.83 1H5.41l.83-1zM5 19V8h14v11H5zm11-5.5H8v-2h8v2z"></path>
  </svg>
);
const IconDocumentacao = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"></path>
  </svg>
);
const IconAnalises = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"></path>
  </svg>
);
const IconBuscar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
  </svg>
);
const IconConfiguracoes = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path fill="none" d="M0 0h24v24H0V0z"></path>
    <path d="M19.14 12.94c.04-.3.06-.61.06-.94s-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.44.17-.48.41l-.36 2.54c-.59.24-1.12.56-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.68 9.29c-.11.2-.06.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.48.41l.36-2.54c.59-.24 1.12-.56 1.62-.94l2.39.96c.22.08.47.01.59-.22l1.92-3.32c.11-.2.06-.47-.12-.61l-2.03-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"></path>
  </svg>
);

function SideBar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="sidebar-toggle"
        aria-label="Toggle sidebar"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "✕" : "☰"}
      </button>

      <div className={`sidebar-container ${open ? "open" : ""}`}>
        <div className="sidebar-header">Navegação</div>

        <div className="btn-nav">
          <IconDashboard />
          <a>Dashboard</a>
        </div>

        <div className="btn-nav">
          <IconRepositorios />
          <a>Repositórios</a>
        </div>

        <div className="btn-nav">
          <IconDocumentacao />
          <a>Documentação</a>
        </div>

        <div className="btn-nav">
          <IconAnalises />
          <a>Análises</a>
        </div>

        <div className="btn-nav">
          <IconBuscar />
          <a>Buscar</a>
        </div>
        <div className="sidebar-header">Sistema</div>
        <div className="btn-nav">
          <IconConfiguracoes />
          <a>Configurações</a>
        </div>
      </div>
    </>
  );
}

export default SideBar;
