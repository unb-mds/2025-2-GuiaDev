import { useState, useEffect } from "react";
import "./App.css"; 
import Login from "./Login"; 
import SideBar from "./components/Sidebar/Sidebar.jsx"; 
import BoxRepo from "./components/BoxRepo/Boxrepo.jsx"; 
import Header from "./Header.jsx";
//outlett aquii

function App() {
 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  

  useEffect(() => {

    if (window.location.pathname.toLowerCase() === "/main") {
      setIsLoggedIn(true);
    }
  }, []);


  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };


  


  if (!isLoggedIn) {
    return (
      <div className="App">
        {/* Passa a função de sucesso para o Login */}
        <Login onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

 
  return (
    <>
     <Header/>
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