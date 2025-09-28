import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import SideBar from "./components/Sidebar/Sidebar.jsx";
import BoxRepo from "./components/BoxRepo/Boxrepo.jsx";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className="Main">
        
          <SideBar />
       
        <div className="Boxrepo">
          <BoxRepo />
        </div>
      </div>
    </>
  );
}

export default App;
