import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Footer from './Footer';

describe('Componente Footer', () => {

    const currentYear = new Date().getFullYear();


    test('deve renderizar o texto de direitos autorais com o ano atual', () => {
        render(<Footer />);


        const expectedText = `© ${currentYear} GuiaDev. Desenvolvido para desenvolvedores, por desenvolvedores.`;


        expect(screen.getByText(expectedText, { exact: false })).toBeInTheDocument();
    });


    test('deve renderizar o link "Documentação"', () => {
        render(<Footer />);


        const linkElement = screen.getByRole('link', { name: /Documentação/i });


        expect(linkElement).toBeInTheDocument();


        expect(linkElement).toHaveAttribute('href', '/documentacao');
    });


    test('não deve renderizar conteúdo vazio ou quebrar', () => {
        const { container } = render(<Footer />);


        expect(container.querySelector('footer')).toBeInTheDocument();
    });
});