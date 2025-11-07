import React, { useState } from 'react';
import './LearningPage.css';
import LearningCard from '../../components/LearningCard/Card';
import Chat from '../../components/Chat/Chat';

const ExplainDoc = ({ name, card }) => {
  const [openStructure, setOpenStructure] = useState(false);
  const [openPractices, setOpenPractices] = useState(false);

  return (
    <>
      {/* Estrutura */}
      <div className={`panel ${openStructure ? 'active' : ''}`}>
        <div className="estructureDocs">
          <button
            onClick={() => setOpenStructure(s => !s)}
            aria-expanded={openStructure}
          >
            <span>Estrutura do {name}</span>
          </button>
        </div>

        <div className="estructureDocs">
          {openStructure ? (
            <div className='contentLearning'>
              {card?.expandedText ? (
                <p>{card.expandedText}</p>
              ) : (
                <p>
                  O arquivo {name} contém informações essenciais para o projeto, incluindo seções,
                  objetivos e exemplos que auxiliam na documentação e organização.
                </p>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Boas práticas */}
      <div className={`panel ${openPractices ? 'active' : ''}`}>
        <div className="estructureDocs">
          <button
            onClick={() => setOpenPractices(s => !s)}
            aria-expanded={openPractices}
          >
            <span>Boas práticas</span>
          </button>
        </div>

        <div className="estructureDocs">
          {openPractices ? (
            <div className='contentLearning'>
              <p>
                As boas práticas para o arquivo {name} incluem padronização de formatação, 
                clareza nas informações, uso de exemplos atualizados e alinhamento com 
                as diretrizes do GuiaDev. Sempre mantenha o conteúdo revisado e acessível.
              </p>
              {card?.expandedText && (
                <p className='note'>Dica: {card.expandedText}</p>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};

const MockIcon = ({ children }) => <>{children}</>;

export default function LearningPage() {
  const [selectedCard, setSelectedCard] = useState(null);

  const cardData = [
    { title: 'Stories Maps', icon: <MockIcon>📊</MockIcon>, expandedText: 'Documento visual que mostra a jornada do usuário e ajuda a priorizar funcionalidades do projeto GuiaDev.' },
    { title: 'CODE_OF_CONDUCT.md', expandedText: 'Define diretrizes de comportamento e respeito entre colaboradores do projeto, promovendo um ambiente inclusivo e acolhedor.' },
    { title: 'CHANGELOG.md', expandedText: 'Registra o histórico de mudanças, correções e novas funcionalidades implementadas em cada versão do projeto.' },
    { title: 'CONTRIBUTING.md', expandedText: 'Guia completo para novos contribuidores: explica como criar branches, abrir pull requests e seguir o padrão de commits do GuiaDev.' },
    { title: '.gitignore', expandedText: 'Lista de arquivos e diretórios que o Git deve ignorar (ex: node_modules, logs e builds temporários).' },
    { title: 'README.md', expandedText: 'Documento principal do repositório. Apresenta a visão geral do projeto, instruções de instalação, uso com Docker e tecnologias utilizadas.' },
    { title: 'SUPPORT.md', expandedText: 'Orienta como obter suporte, abrir issues ou relatar problemas, garantindo organização e comunicação eficaz entre os membros da equipe.' },
    { title: 'SECURITY.md', expandedText: 'Define a política de segurança, incluindo boas práticas de autenticação e como reportar vulnerabilidades de forma responsável.' },
    { title: 'GOVERNANCE.md', expandedText: 'Descreve a estrutura de governança, papéis da equipe, responsáveis pelas decisões e fluxo de aprovação de mudanças.' },
    { title: 'Testes/CI', expandedText: 'Documenta a suíte de testes e o pipeline de Integração Contínua (CI), garantindo qualidade e consistência nas entregas.' },
    { title: 'docs/', expandedText: 'Pasta dedicada à documentação técnica, contendo diagramas, relatórios de sprint e requisitos do projeto GuiaDev.' },
  ];

  return (
    <div className='renderPage'>
      <div className='textTitle'>
        <p>Aprendizado</p>
        <p className='subtitle'>Boas práticas de documentação de projetos de software</p>
      </div>

      <div className='learningPage'>
        <div className='test'>
          <div className="learning">
            {cardData.map((data, index) => (
              <LearningCard
                key={index}
                title={data.title}
                icon={data.icon}
                expandedText={data.expandedText}
                onSelect={(card) => setSelectedCard(card)}
                selected={selectedCard?.title === data.title}
              />
            ))}
          </div>

          <div className='docsExplain'>
            <div className='titleBox'>Conteúdo Detalhado</div>
            <div className='boxDocsLearning'>
              {selectedCard ? (
                <ExplainDoc key={selectedCard.title} name={selectedCard.title} card={selectedCard} />
              ) : (
                <div className='placeholder'>Selecione um card à esquerda para ver os detalhes.</div>
              )}
            </div>
          </div>
        </div>

        <div className='chat-container'>
          <Chat />
        </div>
      </div>
    </div>
  );
}
