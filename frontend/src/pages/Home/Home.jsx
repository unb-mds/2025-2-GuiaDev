import React from "react";
import "./Home.css";
import LearningCard from "../../components/LearningCard/card";
import Chat from "../../components/Chat/Chat";

const MockIcon = ({ children }) => <>{children}</>;

export default function LearningPage() {
  const cardData = [
    { 
      title: "Stories Maps", 
      icon: <MockIcon>📊</MockIcon>, 
      expandedText: "Introdução aos Stories Maps e sua aplicação em projetos front-end." 
    },
    { 
      title: "CODE_OF_CONDUCT.md", 
      icon: <MockIcon>📜</MockIcon>, 
      expandedText: "Diretrizes de comportamento para a comunidade GuiaDev. Leia antes de contribuir." 
    },
    { 
      title: "CHANGELOG.md", 
      icon: <MockIcon>📝</MockIcon>, 
      expandedText: "Histórico de todas as mudanças e novas funcionalidades do projeto." 
    },
    { 
      title: "CONTRIBUTING.md", 
      icon: <MockIcon>🤝</MockIcon>, 
      expandedText: "Guia completo para quem deseja fazer contribuições ao código." 
    },
    { 
      title: ".gitignore", 
      icon: <MockIcon>🚫</MockIcon>, 
      expandedText: "Lista de arquivos e pastas que o Git deve ignorar ao fazer commit." 
    },
    { 
      title: "README.md", 
      icon: <MockIcon>📖</MockIcon>, 
      expandedText: "Informações essenciais, instalação e visão geral do projeto." 
    },
    { 
      title: "SUPPORT.md", 
      icon: <MockIcon>🆘</MockIcon>, 
      expandedText: "Como obter suporte ou reportar problemas." 
    },
    { 
      title: "SECURITY.md", 
      icon: <MockIcon>🔒</MockIcon>, 
      expandedText: "Política de segurança e como relatar vulnerabilidades." 
    },
    { 
      title: "GOVERNANCE.md", 
      icon: <MockIcon>⚖️</MockIcon>, 
      expandedText: "Estrutura de governança e decisões do projeto." 
    },
    { 
      title: "Testes/CI", 
      icon: <MockIcon>🧪</MockIcon>, 
      expandedText: "Documentação sobre testes e Integração Contínua (CI)." 
    },
    { 
      title: "docs/", 
      icon: <MockIcon>📚</MockIcon>, 
      expandedText: "Pasta com documentação adicional e guias técnicos." 
    },
  ];

  return (
    <div className="learning-page">
      <section className="learning-content">
        <div className="learning-header">
          <h1 className="learning-title">📘 GuiaDev — Learning Dashboard</h1>
          <p className="learning-subtitle">
            Explore os principais documentos e recursos do projeto
          </p>
        </div>

        <div className="learning-grid">
          {cardData.map((data, index) => (
            <LearningCard
              key={index}
              title={data.title}
              icon={data.icon}
              expandedText={data.expandedText}
            />
          ))}
        </div>
      </section>

      <aside className="chat-container">
        <Chat />
      </aside>
    </div>
  );
}
