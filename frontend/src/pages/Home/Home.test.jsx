import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from './Home';

const mockNavigate = jest.fn();

const mockUseSearchParams = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,

    useSearchParams: () => [
        { get: mockUseSearchParams }
    ],
}));


const mockApiPost = jest.fn();
jest.mock('../../../services/api', () => ({
    post: (url, data) => mockApiPost(url, data),
}));


jest.mock('../../components/BoxRepo/Boxrepo', () => ({ owner }) => (
    <div data-testid="mock-box-repo">Repositórios de: {owner}</div>
));


const localStorage = window.localStorage;

describe('Componente Home (Autenticação e Busca)', () => {

    beforeEach(() => {

        jest.clearAllMocks();
        localStorage.clear();
        mockApiPost.mockResolvedValue({ data: { valid: true } });
        mockUseSearchParams.mockReturnValue(null);
    });



    test('deve redirecionar para /login se não houver token na URL ou no localStorage', () => {


        render(<Home />);


        expect(mockNavigate).toHaveBeenCalledWith('/login');
        expect(mockApiPost).not.toHaveBeenCalled();
    });

    test('deve salvar o token da URL e validar com a API', async () => {
        const urlToken = 'token_da_url_123';


        mockUseSearchParams.mockImplementation((key) => {
            if (key === 'token') return urlToken;
            return null;
        });

        render(<Home />);


        await waitFor(() => {

            expect(localStorage.getItem('authToken')).toBe(urlToken);


            expect(mockApiPost).toHaveBeenCalledWith('/auth/checkToken', { token: urlToken });
        });

        expect(mockNavigate).not.toHaveBeenCalled();
    });

    test('deve usar o token do localStorage se não houver token na URL', async () => {
        const storedToken = 'token_do_local_storage_456';


        localStorage.setItem('authToken', storedToken);
        mockUseSearchParams.mockReturnValue(null);

        render(<Home />);


        await waitFor(() => {

            expect(mockApiPost).toHaveBeenCalledWith('/auth/checkToken', { token: storedToken });
        });

        expect(mockNavigate).not.toHaveBeenCalled();
    });




    test('deve renderizar a mensagem inicial se nenhum username foi buscado', () => {

        localStorage.setItem('authToken', 'valid');

        render(<Home />);


        expect(screen.getByText(/Digite o username do GitHub/i)).toBeInTheDocument();
        expect(screen.getByTestId('mock-box-repo')).toHaveTextContent('Repositórios de:');
    });

    test('deve atualizar o BoxRepo com o username após a submissão do formulário', () => {
        localStorage.setItem('authToken', 'valid');

        render(<Home />);

        const input = screen.getByPlaceholderText(/Username \(GitHub\)/i);
        const button = screen.getByRole('button', { name: /Buscar/i });

        const username = 'joao-guilherme-dev';


        fireEvent.change(input, { target: { value: username } });
        expect(input.value).toBe(username);


        fireEvent.submit(button);


        expect(screen.getByTestId('mock-box-repo')).toHaveTextContent(`Repositórios de: ${username}`);
    });

    test('não deve submeter o formulário com input vazio (após trim)', () => {
        localStorage.setItem('authToken', 'valid');

        render(<Home />);

        const input = screen.getByPlaceholderText(/Username \(GitHub\)/i);
        const button = screen.getByRole('button', { name: /Buscar/i });


        fireEvent.change(input, { target: { value: '   ' } });


        fireEvent.submit(button);


        expect(screen.getByTestId('mock-box-repo')).toHaveTextContent('Repositórios de:');
    });
});