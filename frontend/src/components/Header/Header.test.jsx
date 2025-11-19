import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from './Header';



describe('Componente Header', () => {


    test('deve exibir o título principal "GuiaDev"', () => {
        render(<Header />);


        const titleElement = screen.getByRole('heading', { name: /GuiaDev/i });

        expect(titleElement).toBeInTheDocument();
        expect(titleElement).toHaveTextContent('GuiaDev');
    });


    test('deve renderizar a imagem do logo com o texto alternativo (alt)', () => {
        render(<Header />);


        const logoElement = screen.getByRole('img', { name: /Logo do GuiaDev/i });

        expect(logoElement).toBeInTheDocument();


        expect(logoElement).toHaveAttribute('alt', 'Logo do GuiaDev');
    });


    test('deve garantir que o componente Image seja renderizado dentro do Header', () => {
        const { container } = render(<Header />);


        expect(container.querySelector('img')).toBeInTheDocument();
        expect(container.querySelector('header')).toBeInTheDocument();
    });
});