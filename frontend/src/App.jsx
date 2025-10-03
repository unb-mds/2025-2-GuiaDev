import { Outlet, useLocation } from "react-router-dom"; // 1. Importe o Outlet!
import Header from "./components/Header/Header.jsx";
import SideBar from "./components/Sidebar/Sidebar.jsx";
import "./App.css";

function App() {
  const location = useLocation();
  const  hiddenSideBarPaths = ["/login"];
  const showSideBar = !hiddenSideBarPaths.includes(location.pathname); 

  return (
    <div className="AppContainer">
      <Header />
      <div className="Main">
       {showSideBar && <SideBar />}

        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default App;
