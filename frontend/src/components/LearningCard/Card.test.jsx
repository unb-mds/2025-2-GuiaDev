import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LearningCard from './Card.jsx';



const defaultProps = {
    title: 'Análise de Código',
    icon: '💻',
    expandedText: 'Detalhes sobre a análise estática e dinâmica.',
    onSelect: jest.fn(),
    selected: false,
};

describe('Componente LearningCard', () => {


    beforeEach(() => {
        defaultProps.onSelect.mockClear();
    });


    test('deve renderizar o título, ícone e botão de expansão no estado colapsado', () => {
        render(<LearningCard {...defaultProps} />);


        expect(screen.getByText(defaultProps.title)).toBeInTheDocument();


        expect(screen.getByRole('img', { name: /ícone/i })).toBeInTheDocument();


        const toggleButton = screen.getByRole('button', { name: '+' });
        expect(toggleButton).toBeInTheDocument();


        const expandedContent = screen.getByText(defaultProps.expandedText, { exact: false });
        expect(expandedContent).not.toBeVisible();
    });


    test('deve expandir o conteúdo ao clicar no botão (+)', () => {
        render(<LearningCard {...defaultProps} />);

        const initialButton = screen.getByRole('button', { name: '+' });


        fireEvent.click(initialButton);


        const expandedContent = screen.getByText(defaultProps.expandedText, { exact: false });
        expect(expandedContent).toBeVisible();

        const collapseButton = screen.getByRole('button', { name: '-' });
        expect(collapseButton).toBeInTheDocument();


        fireEvent.click(collapseButton);

        expect(expandedContent).not.toBeVisible();

        expect(screen.getByRole('button', { name: '+' })).toBeInTheDocument();
    });


    test('não deve chamar onSelect ao clicar no botão de expansão', () => {
        render(<LearningCard {...defaultProps} />);

        const toggleButton = screen.getByRole('button', { name: '+' });


        fireEvent.click(toggleButton);


        expect(defaultProps.onSelect).not.toHaveBeenCalled();
    });

    test('deve chamar onSelect ao clicar no corpo do card (fora do botão)', () => {
        render(<LearningCard {...defaultProps} />);

        const cardElement = screen.getByText(defaultProps.title).closest('.card-conteudo');

        // Clica no corpo do card (div principal)
        fireEvent.click(cardElement);

        // Verifica se o onSelect foi chamado UMA VEZ com os dados corretos
        expect(defaultProps.onSelect).toHaveBeenCalledTimes(1);
        expect(defaultProps.onSelect).toHaveBeenCalledWith(
            expect.objectContaining({
                title: defaultProps.title,
                icon: defaultProps.icon,
            })
        );
    });


    test('deve aplicar a classe "selected" se a prop selected for true', () => {
        render(<LearningCard {...defaultProps} selected={true} />);

        const cardElement = screen.getByText(defaultProps.title).closest('.card-conteudo');

        expect(cardElement).toHaveClass('selected');
    });
});