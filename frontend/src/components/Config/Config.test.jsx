import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConfigComponent from '../Config';
import api from '../../../services/api';


const mockApiGet = jest.fn();
const mockApiPatch = jest.fn();

jest.mock('../../../services/api', () => ({
    get: (url) => mockApiGet(url),
    patch: (url, data) => mockApiPatch(url, data),
}));


const MOCK_PROFILE = {
    email: 'dev.test@guiadev.com',
    usernameGit: 'dev_github_handle',
    username: 'legacy_user',
};


jest.useFakeTimers();

describe('Componente ConfigComponent', () => {

    const mockOnClose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        mockApiGet.mockResolvedValue({ data: { user: MOCK_PROFILE } });
    });


    const runAsyncEffect = async () => {

        jest.advanceTimersByTime(0);

        await waitFor(() => expect(mockApiGet).toHaveBeenCalled());
    };



    test('deve mostrar "Carregando…" inicialmente', () => {
        render(<ConfigComponent onClose={mockOnClose} />);

        expect(screen.getByText('Carregando…')).toBeInTheDocument();
    });

    test('deve carregar os dados do perfil e preencher o formulário', async () => {
        render(<ConfigComponent onClose={mockOnClose} />);

        await runAsyncEffect();


        expect(screen.queryByText('Carregando…')).not.toBeInTheDocument();


        const githubInput = screen.getByPlaceholderText('usernameGitHub');
        const emailInput = screen.getByPlaceholderText('seu@email.com');

        expect(githubInput.value).toBe(MOCK_PROFILE.usernameGit);
        expect(emailInput.value).toBe(MOCK_PROFILE.email);


        expect(mockApiGet).toHaveBeenCalledWith('/auth/profile');
    });

    test('deve mostrar erro se a API de perfil falhar no carregamento', async () => {
        const errorMessage = 'Token expirado';
        mockApiGet.mockRejectedValue({ response: { data: { message: errorMessage } } });

        render(<ConfigComponent onClose={mockOnClose} />);

        await runAsyncEffect();


        expect(screen.getByText(errorMessage)).toBeInTheDocument();

        expect(screen.queryByPlaceholderText('usernameGitHub')).not.toBeInTheDocument();
    });



    test('deve chamar a API PATCH com os novos dados e fechar o modal em sucesso', async () => {
        const newEmail = 'novo.dev@mail.com';
        const newPassword = 'senha_nova123';

        // Mock para retorno do PATCH
        mockApiPatch.mockResolvedValue({ data: { user: { email: newEmail } } });

        render(<ConfigComponent onClose={mockOnClose} />);
        await runAsyncEffect();

        // 1. Altera os campos
        fireEvent.change(screen.getByPlaceholderText('seu@email.com'), { target: { value: newEmail } });
        fireEvent.change(screen.getByPlaceholderText('Altere sua senha!'), { target: { value: newPassword } });

        const saveButton = screen.getByRole('button', { name: 'Salvar' });
        fireEvent.click(saveButton);


        expect(screen.getByText('Salvando…')).toBeInTheDocument();


        await waitFor(() => {
            expect(mockApiPatch).toHaveBeenCalledWith("/user/userUpdate", {
                email: newEmail,
                usernameGit: MOCK_PROFILE.usernameGit,
                senha: newPassword,
            });
        });


        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('deve mostrar erro se a submissão (PATCH) falhar', async () => {
        const patchError = 'E-mail já está em uso.';

        mockApiPatch.mockRejectedValue({ response: { data: { message: patchError } } });

        render(<ConfigComponent onClose={mockOnClose} />);
        await runAsyncEffect(); // 


        fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));

        await waitFor(() => {

            expect(screen.getByText(patchError)).toBeInTheDocument();
        });


        expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument();
        expect(mockOnClose).not.toHaveBeenCalled();
    });



    test('deve chamar onClose ao clicar em "Cancelar"', async () => {
        render(<ConfigComponent onClose={mockOnClose} />);
        await runAsyncEffect(); // Carrega os dados iniciais

        fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
});