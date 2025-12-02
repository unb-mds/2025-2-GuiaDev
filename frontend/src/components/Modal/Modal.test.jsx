import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Modal from '../Modal';

import { createPortal } from 'react-dom';


jest.mock('react-dom', () => ({
    ...jest.requireActual('react-dom'),
    createPortal: (node) => node,
}));


describe('Componente Modal', () => {

    const mockOnClose = jest.fn();
    const mockChildren = <div data-testid="modal-children-content">Conteúdo do Modal</div>;

    beforeEach(() => {
        mockOnClose.mockClear();
    });

    test('não deve renderizar o modal se isOpen for false', () => {
        const { container } = render(
            <Modal isOpen={false} onClose={mockOnClose} title="Teste">
                {mockChildren}
            </Modal>
        );

        expect(container.firstChild).toBeNull();
        expect(screen.queryByText('Conteúdo do Modal')).not.toBeInTheDocument();
    });

    test('deve renderizar o modal e o conteúdo quando isOpen for true', () => {
        const testTitle = 'Preferências do Usuário';
        render(
            <Modal isOpen={true} onClose={mockOnClose} title={testTitle}>
                {mockChildren}
            </Modal>
        );

        expect(screen.getByRole('heading', { name: testTitle })).toBeInTheDocument();

        expect(screen.getByText('Gerencie as preferências da sua conta e aplicação')).toBeInTheDocument();

        expect(screen.getByTestId('modal-children-content')).toBeInTheDocument();

        expect(screen.getByRole('button', { name: 'x' })).toBeInTheDocument();
    });

    test('deve chamar onClose ao clicar no botão de fechar (X)', () => {
        render(
            <Modal isOpen={true} onClose={mockOnClose} title="Teste">
                {mockChildren}
            </Modal>
        );

        const closeButton = screen.getByRole('button', { name: 'x' });
        fireEvent.click(closeButton);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('deve chamar onClose ao clicar no backdrop (fora do diálogo)', () => {
        render(
            <Modal isOpen={true} onClose={mockOnClose} title="Teste">
                {mockChildren}
            </Modal>
        );

        const backdrop = screen.getByText('Conteúdo do Modal').closest('.modal-backdrop');

        fireEvent.click(backdrop);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('NÃO deve chamar onClose ao clicar no conteúdo do diálogo', () => {
        render(
            <Modal isOpen={true} onClose={mockOnClose} title="Teste">
                {mockChildren}
            </Modal>
        );

        const content = screen.getByTestId('modal-children-content');

        fireEvent.click(content);

        expect(mockOnClose).not.toHaveBeenCalled();
    });
});