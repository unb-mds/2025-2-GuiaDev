import React, { createContext, useContext, useState } from "react";
import Modal from "../components/Modal/Modal";
import ConfigComponent from "../components/Config/Config";

const ConfigModalContext = createContext(null);

export function ConfigModalProvider({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <ConfigModalContext.Provider value={{ open, setOpen }}>
      {children}

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Configurações">
        <ConfigComponent onClose={() => setOpen(false)} />
      </Modal>
    </ConfigModalContext.Provider>
  );
}

export function useConfigModal() {
  const ctx = useContext(ConfigModalContext);

  return ctx;
}

export default ConfigModalContext;
