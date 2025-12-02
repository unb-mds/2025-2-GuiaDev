import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Chat from '../Chat';
import api from '../../../services/api';


const mockApiPost = jest.fn();
jest.mock('../../../services/api', () => ({
    post: (url, data) => mockApiPost(url, data),
}));


jest.mock('../../assets/Logo.svg', () => 'logo-mock.svg');


jest.useFakeTimers();


const mockScrollIntoView = jest.fn();


describe('Componente Chat (IA e Assíncrono)', () => {

    beforeEach(() => {
        jest.clearAllMocks();

        mockApiPost.mockResolvedValue({ data: { response: 'Resposta da IA mockada.' } });


        window.HTMLElement.prototype.scrollIntoView = mockScrollIntoView;
    });


    test('deve renderizar a área de input e o placeholder', () => {
        render(<Chat />);

        expect(screen.getByPlaceholderText('Tire sua dúvida!')).toBeInTheDocument();
        expect(screen.getByText('GuiaDev Chat Box')).toBeInTheDocument();
    });

    test('deve chamar scrollIntoView quando novas mensagens chegam', () => {
        const { rerender } = render(<Chat />);

        expect(mockScrollIntoView).not.toHaveBeenCalled();

        const input = screen.getByPlaceholderText('Tire sua dúvida!');
        fireEvent.change(input, { target: { value: 'Olá' } });
        fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });


        jest.advanceTimersByTime(200);

        expect(mockScrollIntoView).toHaveBeenCalledTimes(1);
    });



    test('deve aplicar debounce e só enviar a API após 200ms', () => {
        render(<Chat />);
        const input = screen.getByPlaceholderText('Tire sua dúvida!');


        fireEvent.change(input, { target: { value: 'Primeira' } });
        fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });
        jest.advanceTimersByTime(100);


        expect(mockApiPost).not.toHaveBeenCalled();


        fireEvent.change(input, { target: { value: 'Segunda Mensagem' } });
        fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });


        expect(mockApiPost).not.toHaveBeenCalled();


        jest.advanceTimersByTime(200);


        expect(mockApiPost).toHaveBeenCalledTimes(1);
        expect(mockApiPost).toHaveBeenCalledWith('/chat', { message: 'Segunda Mensagem' });
    });




    test('deve exibir mensagem do usuário, estado de digitação e resposta da IA em sucesso', async () => {
        const botResponse = 'Esta é a resposta da inteligência artificial.';
        mockApiPost.mockResolvedValueOnce({ data: { response: botResponse } });

        render(<Chat />);
        const input = screen.getByPlaceholderText('Tire sua dúvida!');


        fireEvent.change(input, { target: { value: 'Qual a dúvida?' } });
        fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });


        jest.advanceTimersByTime(200);


        expect(screen.getByText('Qual a dúvida?')).toBeInTheDocument();

        expect(screen.getByText('Qual a dúvida?').closest('.chat-messages').nextSibling).toHaveClass('backgroundMsg');


        await act(async () => {

            await Promise.resolve();
        });


        await waitFor(() => {
            expect(screen.getByText(botResponse)).toBeInTheDocument();
        });


        expect(input.value).toBe('');
    });


    test('deve exibir mensagem de erro se a chamada da API falhar', async () => {
        mockApiPost.mockRejectedValueOnce(new Error('Network error'));

        render(<Chat />);
        const input = screen.getByPlaceholderText('Tire sua dúvida!');

        fireEvent.change(input, { target: { value: 'Dúvida com erro' } });
        fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });

        jest.advanceTimersByTime(200);


        await act(async () => {
            await Promise.resolve();
        });


        await waitFor(() => {
            expect(screen.getByText('Erro ao obter resposta da IA')).toBeInTheDocument();
        });
    });
});