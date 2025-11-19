import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from './Login.jsx'; // Caminho local corrigido

// ==========================================================
// MOCKS DOS COMPONENTES FILHOS
// ==========================================================

// 1. Mock do componente Sign_in (para isolar o Login)
jest.mock('../../components/Sign-in/Sign-in', () => {
    return () => <div data-testid="mock-sign-in">Sign-in Mockado</div>;
});

// 2. Mock do componente Footer (para isolar o Login)
jest.mock('../../components/Footer/Footer', () => {
    return () => <footer data-testid="mock-footer">Footer Mockado</footer>;
});


describe('Componente Login (Layout Container)', () => {

    // ==========================================================
    // Teste 1: Renderização do Conteúdo Estático
    // ==========================================================
    test('deve renderizar o título principal e as promessas de valor', () => {
        render(<Login />);

        // Verifica o título principal
        expect(screen.getByRole('heading', { name: /Bem-Vindo ao GuiaDev/i })).toBeInTheDocument();

        // Verifica a presença de pelo menos uma das promessas de valor
        expect(screen.getByText('🚀 Acelere seu aprendizado')).toBeInTheDocument();
        expect(screen.getByText('📖 Recursos exclusivos')).toBeInTheDocument();
    });

    // ==========================================================
    // Teste 2: Renderização dos Componentes Filhos
    // ==========================================================
    test('deve renderizar o formulário de Sign-in e o Footer', () => {
        render(<Login />);

        // Verifica se o mock do Sign_in foi renderizado no lugar do componente real
        expect(screen.getByTestId('mock-sign-in')).toBeInTheDocument();

        // Verifica se o mock do Footer foi renderizado
        expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
    });

    // ==========================================================
    // Teste 3: Verificação de Estrutura (Classes)
    // ==========================================================
    test('deve aplicar as classes CSS de layout corretas', () => {
        const { container } = render(<Login />);

        // Verifica se a div principal possui a classe 'login-page'
        expect(container.firstChild).toHaveClass('login-page');

        // Verifica a estrutura do layout de duas colunas
        expect(container.querySelector('.content-left')).toBeInTheDocument();
        expect(container.querySelector('.content-right')).toBeInTheDocument();
    });
});