import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Login from './Login' // importando o Login

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="App">
        <Login />
      </div>
    </>
  )
}

export default App
