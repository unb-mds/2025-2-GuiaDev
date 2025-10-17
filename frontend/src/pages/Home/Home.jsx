import React from "react";
import "./Home.css";
import LearningCard from "../../components/LearningCard/card";
import Chat from "../../components/Chat/Chat";
import {
  BookOpen,
  FileText,
  ScrollText,
  Handshake,
  Shield,
  FolderGit2,
  FlaskConical,
  BookMarked,
  Gavel,
  Ban,
  HelpCircle,
} from "lucide-react";

export default function LearningPage() {
  const cardData = [
    { title: "Stories Maps", icon: <BookOpen size={22} />, expandedText: "Introdução aos Stories Maps e sua aplicação em projetos front-end." },
    { title: "CODE_OF_CONDUCT.md", icon: <ScrollText size={22} />, expandedText: "Diretrizes de comportamento para a comunidade GuiaDev. Leia antes de contribuir." },
    { title: "CHANGELOG.md", icon: <FileText size={22} />, expandedText: "Histórico de todas as mudanças e novas funcionalidades do projeto." },
    { title: "CONTRIBUTING.md", icon: <Handshake size={22} />, expandedText: "Guia completo para quem deseja fazer contribuições ao código." },
    { title: ".gitignore", icon: <Ban size={22} />, expandedText: "Lista de arquivos e pastas que o Git deve ignorar ao fazer commit." },
    { title: "README.md", icon: <BookMarked size={22} />, expandedText: "Informações essenciais, instalação e visão geral do projeto." },
    { title: "SUPPORT.md", icon: <HelpCircle size={22} />, expandedText: "Como obter suporte ou reportar problemas." },
    { title: "SECURITY.md", icon: <Shield size={22} />, expandedText: "Política de segurança e como relatar vulnerabilidades." },
    { title: "GOVERNANCE.md", icon: <Gavel size={22} />, expandedText: "Estrutura de governança e decisões do projeto." },
    { title: "Testes/CI", icon: <FlaskConical size={22} />, expandedText: "Documentação sobre testes e Integração Contínua (CI)." },
    { title: "docs/", icon: <FolderGit2 size={22} />, expandedText: "Pasta com documentação adicional e guias técnicos." },
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
