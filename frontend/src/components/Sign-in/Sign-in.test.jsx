import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Sign_in from './Sign-in.jsx';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api.js';



// Mock da função navigate do react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

// Mock da chamada de API
const mockApiPost = jest.fn();
jest.mock('../../../services/api', () => ({
    post: (url, data) => mockApiPost(url, data),
}));

// Mock do localStorage
const localStorageMock = (function () {
    let store = {};
    return {
        getItem: jest.fn((key) => store[key] || null),
        setItem: jest.fn((key, value) => {
            store[key] = value.toString();
        }),
        clear: jest.fn(() => {
            store = {};
        }),
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });


window.open = jest.fn();
jest.mock('../Register/Register', () => {
    return ({ onSwitchToLogin }) => (
        <div data-testid="register-mock">
            <button onClick={onSwitchToLogin}>Voltar para Login</button>
        </div>
    );
});



describe('Componente Sign_in', () => {


    beforeEach(() => {
        jest.clearAllMocks();
        localStorageMock.clear();
    });


    test('deve renderizar os campos de email, senha e o botão "Entrar"', () => {
        render(<Sign_in />);


        expect(screen.getByLabelText(/E-mail/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Senha/i)).toBeInTheDocument();
        expect(screen.getByTestId('login-submit-button')).toBeInTheDocument();
    });


    test('deve atualizar o estado ao digitar nos campos', () => {
        render(<Sign_in />);

        const emailInput = screen.getByLabelText(/E-mail/i);
        const senhaInput = screen.getByLabelText(/Senha/i);

        // Simula a digitação
        fireEvent.change(emailInput, { target: { value: 'teste@guiadev.com' } });
        fireEvent.change(senhaInput, { target: { value: 'senha123' } });

        expect(emailInput.value).toBe('teste@guiadev.com');
        expect(senhaInput.value).toBe('senha123');
    });


    test('deve salvar o token e navegar para /home em caso de sucesso no login', async () => {

        const mockToken = 'jwt-token-de-sucesso-12345';
        mockApiPost.mockResolvedValueOnce({
            data: { access_token: mockToken },
        });

        render(<Sign_in />);


        fireEvent.change(screen.getByLabelText(/E-mail/i), {
            target: { value: 'user@success.com' },
        });
        fireEvent.change(screen.getByLabelText(/Senha/i), {
            target: { value: 'password' },
        });


        fireEvent.click(screen.getByTestId('login-submit-button'));


        await waitFor(() => {

            expect(mockApiPost).toHaveBeenCalledWith('/auth/login', {
                email: 'user@success.com',
                password: 'password',
            });


            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                'authToken',
                mockToken
            );


            expect(mockNavigate).toHaveBeenCalledWith('/home');
        });
    });


    test('deve exibir alerta e não navegar em caso de falha no login', async () => {

        window.alert = jest.fn();


        mockApiPost.mockRejectedValueOnce(new Error('Credenciais inválidas'));

        render(<Sign_in />);


        fireEvent.change(screen.getByLabelText(/E-mail/i), { target: { value: 'user@fail.com' } });
        fireEvent.change(screen.getByLabelText(/Senha/i), { target: { value: 'wrongpass' } });
        fireEvent.click(screen.getByTestId('login-submit-button'));


        await waitFor(() => {

            expect(window.alert).toHaveBeenCalledWith(
                'E-mail ou senha inválidos. Tente novamente.'
            );


            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });


    test('deve mudar para o componente Register ao clicar no botão "Cadastro"', () => {



        render(<Sign_in />);


        fireEvent.click(screen.getByRole('button', { name: /Cadastro/i }));

        expect(screen.getByTestId('register-mock')).toBeInTheDocument();


        expect(screen.queryByRole('button', { name: /Entrar na sua conta/i })).not.toBeInTheDocument();
    });


    test('deve chamar window.open para o login com GitHub', () => {
        render(<Sign_in />);

        const githubButton = screen.getByRole('button', { name: /GitHub/i });

        fireEvent.click(githubButton);


        expect(window.open).toHaveBeenCalledWith(
            'http://localhost:3000/auth/github',
            '_self'
        );
    });
});