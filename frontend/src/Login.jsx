import React, {useState} from "react";
import "./Login.css"
import Header from "./Header";
import Footer from "./Footer";

export default function Login() {
    const [email, setEmail] = useState("")
    const [senha, setSenha] = useState("")


const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Email:", email)
    console.log("Senha:", senha)
    // Aqui você faria a integração com o backend (API)
}
return(
    <div className="login-page">
        <Header></Header>
        <div className="content">
            <div className="content-left">
                <h1>
                    Bem-Vindo ao <span>GuiaDev</span>
                </h1>
                <p style={{ marginTop: "-0.5em" }}><strong>Sua plataforma completa para desenvolvimento profissional</strong></p>
                <ul>
                    <li><strong>🚀 Acelere seu aprendizado</strong></li>
                    <li><strong>👥 Conecte-se com devs</strong></li>
                    <li><strong>📖 Recursos exclusivos</strong></li>
                </ul>
            </div>
            
            <div className="content-right">
                
            <div className="login-box">
                <div className="tabs">
                    <button className="active">Entrar</button>
                    <button>Cadastro</button>
                </div>    
                <h2>Entrar na sua conta</h2>
                <p className="subtitle">Acesse sua jornada de desenvolvedor</p>

                <form onSubmit={handleSubmit}>
                    <label>E-mail</label>
                    <input
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <label>Senha</label>
                    <input
                        type="password"
                        placeholder="**********"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        required
                    />
                    <div className="options">
                        <label style={{ display : "flex", alignItems: "center", gap: " -0.5rem" }}>
                            <input type="checkbox"/> Lembrar de mim
                        </label>
                        <a href="#">Esqueci minha senha</a>
                    </div>
                    <button type="submit" className="btn-entrar">
                        Entrar
                    </button>
                </form>
                <div className="divider">ou continue com</div>

                <div className="social-login">
                    <button className="btn-social google">Google</button>
                    <button className="btn-social github">GitHub</button>
                </div>
            </div>
        
            </div>
        </div>
        <Footer />
    </div>
);
}



