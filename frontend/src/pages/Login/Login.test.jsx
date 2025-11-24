import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Login from './Login.jsx';


jest.mock('../../components/Sign-in/Sign-in', () => {
    return () => <div data-testid="mock-sign-in">Sign-in Mockado</div>;
});


jest.mock('../../components/Footer/Footer', () => {
    return () => <footer data-testid="mock-footer">Footer Mockado</footer>;
});


describe('Componente Login (Layout Container)', () => {


    test('deve renderizar o título principal e as promessas de valor', () => {
        render(<Login />);


        expect(screen.getByRole('heading', { name: /Bem-Vindo ao GuiaDev/i })).toBeInTheDocument();


        expect(screen.getByText('🚀 Acelere seu aprendizado')).toBeInTheDocument();
        expect(screen.getByText('📖 Recursos exclusivos')).toBeInTheDocument();
    });


    test('deve renderizar o formulário de Sign-in e o Footer', () => {
        render(<Login />);


        expect(screen.getByTestId('mock-sign-in')).toBeInTheDocument();


        expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
    });


    test('deve aplicar as classes CSS de layout corretas', () => {
        const { container } = render(<Login />);


        expect(container.firstChild).toHaveClass('login-page');


        expect(container.querySelector('.content-left')).toBeInTheDocument();
        expect(container.querySelector('.content-right')).toBeInTheDocument();
    });
});