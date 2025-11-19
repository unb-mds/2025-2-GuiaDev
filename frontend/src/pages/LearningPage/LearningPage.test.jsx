import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LearningPage from './LearningPage';

const MockLearningCard = jest.fn(({ title, onSelect, selected }) => (
    <div
        data-testid={`card-${title.replace(/\./g, '_')}`}
        className={selected ? 'selected' : ''}
        onClick={() => onSelect({
            title: title,
            icon: 'mock-icon',
            expandedText: title === 'Stories Maps' ? 'Documento visual que mostra a jornada do usuário...' : 'mock-text'
        })}
    >
        {title}
    </div>
));
jest.mock('../../components/LearningCard/Card', () => ({

    default: (props) => <div data-testid="card-mock">{props.title}</div>
}));

jest.mock('../../components/Chat/Chat', () => () => <div data-testid="mock-chat">Chat</div>);


describe('Componente LearningPage (Seleção e Layout)', () => {

    beforeEach(() => {
        MockLearningCard.mockClear();
    });

    test('deve renderizar o título da página e todos os LearningCards', () => {
        render(<LearningPage />);

        expect(screen.getByText('Aprendizado')).toBeInTheDocument();
        expect(screen.getByTestId('mock-chat')).toBeInTheDocument();

        // Placeholder inicial deve estar visível
        expect(screen.getByText('Selecione um card à esquerda para ver os detalhes.')).toBeInTheDocument();
    });

    test('deve renderizar o conteúdo detalhado do card selecionado e aplicar a classe "selected"', () => {
        render(<LearningPage />);

        const cardTitle = 'CODE_OF_CONDUCT.md';

        const codeCard = screen.getByText(cardTitle).closest(`[data-testid="card-${cardTitle.replace(/\./g, '_')}"]`);

        fireEvent.click(codeCard);

        expect(screen.queryByText('Selecione um card à esquerda para ver os detalhes.')).not.toBeInTheDocument();


        expect(codeCard).toHaveClass('selected');

        expect(screen.getByText('Estrutura do CODE_OF_CONDUCT.md')).toBeInTheDocument();


        expect(screen.getByText(/garantir linguagem inclusiva e acessível/i)).toBeInTheDocument();
    });

    test('deve remover a seleção do card anterior ao selecionar um novo card', () => {
        render(<LearningPage />);

        const card1Title = 'Stories Maps';
        const card2Title = 'CHANGELOG.md';

        const card1 = screen.getByText(card1Title).closest('[data-testid^="card-"]');
        const card2 = screen.getByText(card2Title).closest('[data-testid^="card-"]');


        fireEvent.click(card1);
        expect(card1).toHaveClass('selected');


        fireEvent.click(card2);


        expect(card1).not.toHaveClass('selected');


        expect(card2).toHaveClass('selected');
    });
});