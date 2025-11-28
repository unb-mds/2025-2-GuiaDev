import React, { useState } from "react";
import Modal from "../../components/Modal/Modal";
import ConfigComponent from "../../components/config/Config";
import "./ConfigPage.css";

export default function ConfigPage({ open: openProp, setOpen: setOpenProp }) {

  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = typeof openProp === "boolean" && typeof setOpenProp === "function";
  const open = isControlled ? openProp : internalOpen;
  const setOpen = isControlled ? setOpenProp : setInternalOpen;

  return (
    <div className="configpage-container">

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Configurações">
        <ConfigComponent onClose={() => setOpen(false)} />
      </Modal>
    </div>
  );
}
