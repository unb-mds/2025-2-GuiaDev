import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Register from './Register';


const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({

    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));


const mockApiPost = jest.fn();
jest.mock('../../../services/api', () => ({
    post: (url, data) => mockApiPost(url, data),
}));


window.alert = jest.fn();



describe('Componente Register', () => {

    jest.useRealTimers();
    const mockOnSwitchToLogin = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        window.alert.mockClear();
    });


    test('deve renderizar todos os campos e o botão "Criar Conta" com IDs de acessibilidade', () => {
        render(<Register onSwitchToLogin={mockOnSwitchToLogin} />);


        expect(screen.getByLabelText('Nome')).toBeInTheDocument();
        expect(screen.getByLabelText('Sobrenome')).toBeInTheDocument();
        expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
        expect(screen.getByLabelText('Senha')).toBeInTheDocument();


        expect(screen.getByRole('button', { name: /Criar Conta/i })).toBeInTheDocument();


        expect(screen.getByRole('button', { name: /Entrar/i })).toBeInTheDocument();
    });


    test('deve atualizar o estado ao digitar em todos os campos do formulário', () => {
        render(<Register onSwitchToLogin={mockOnSwitchToLogin} />);

        const nameInput = screen.getByLabelText('Nome');
        const emailInput = screen.getByLabelText('E-mail');
        const senhaInput = screen.getByLabelText('Senha');


        fireEvent.change(nameInput, { target: { value: 'Joao Teste' } });
        fireEvent.change(emailInput, { target: { value: 'joao@teste.com' } });
        fireEvent.change(senhaInput, { target: { value: '123456' } });


        expect(nameInput.value).toBe('Joao Teste');
        expect(emailInput.value).toBe('joao@teste.com');
        expect(senhaInput.value).toBe('123456');
    });


    test('deve chamar a API, mostrar sucesso e retornar ao login', async () => {

        mockApiPost.mockResolvedValueOnce({
            data: { message: 'User created' },
        });

        render(<Register onSwitchToLogin={mockOnSwitchToLogin} />);


        fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'João' } });
        fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'joao@success.com' } });
        fireEvent.change(screen.getByLabelText('Sobrenome'), { target: { value: 'Silva' } });
        fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'senha123' } });


        fireEvent.click(screen.getByRole('button', { name: /Criar Conta/i }));


        await waitFor(() => {

            expect(mockApiPost).toHaveBeenCalledWith('/auth/register', {
                email: 'joao@success.com',
                name: 'João',
                lastName: 'Silva',
                password: 'senha123',
            });


            expect(window.alert).toHaveBeenCalledWith('Cadastro realizado com sucesso! Agora você pode fazer login.');


            expect(mockOnSwitchToLogin).toHaveBeenCalledTimes(1);
        });
    });


    test('deve mostrar alerta de erro e não chamar onSwitchToLogin em caso de falha na API', async () => {

        mockApiPost.mockRejectedValueOnce(new Error('E-mail já existe'));

        render(<Register onSwitchToLogin={mockOnSwitchToLogin} />);


        fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'João' } });
        fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'joao@fail.com' } });
        fireEvent.change(screen.getByLabelText('Senha'), { target: { value: '123456' } });

        fireEvent.click(screen.getByRole('button', { name: /Criar Conta/i }));


        await waitFor(() => {

            expect(window.alert).toHaveBeenCalledWith('Erro ao criar conta. Tente novamente.');

            expect(mockOnSwitchToLogin).not.toHaveBeenCalled();
        }, { timeout: 10000 });
    }, 10000);
});