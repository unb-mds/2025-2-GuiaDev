import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BoxRepo from './Boxrepo';
import { useNavigate } from 'react-router-dom';
import GitHubAPI from '../../../services/github';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));


const mockAnalyzeUserRepos = jest.fn();
jest.mock('../../../services/github', () => ({

    analyzeUserRepos: (owner) => mockAnalyzeUserRepos(owner),
}));

jest.useFakeTimers();

const mockReposData = [
    { id: 1, nomeRepositorio: 'front-end-guide', nome: 'Frontend Guide', docsScore: 85 },
    { id: 2, nomeRepositorio: 'backend-api', nome: 'Backend API', docsScore: 40 },
];

describe('Componente BoxRepo (Exibição de Repositórios)', () => {

    const TEST_OWNER = 'joao-guilherme-dev';

    beforeEach(() => {
        jest.clearAllMocks();

        mockAnalyzeUserRepos.mockResolvedValue(mockReposData);

        mockNavigate.mockClear();
    });


    test('deve mostrar placeholders se a prop owner estiver vazia', () => {
        render(<BoxRepo owner="" />);

        expect(screen.getByText(/Digite o nome de usuário do GitHub/i)).toBeInTheDocument();

        expect(screen.getByText('Digite o nome de usuário do GitHub no campo acima e clique em "Buscar".')).toBeInTheDocument();


        expect(mockAnalyzeUserRepos).not.toHaveBeenCalled();
    });

    test('deve chamar a API ao receber um owner e mostrar estado de loading', () => {
        render(<BoxRepo owner={TEST_OWNER} />);

        expect(screen.getAllByText(`Buscando repositórios de "${TEST_OWNER}"...`)).toHaveLength(2);


        expect(mockAnalyzeUserRepos).toHaveBeenCalledWith(TEST_OWNER);

        expect(screen.queryByText(/Ainda não há estatísticas disponíveis/i)).not.toBeInTheDocument();
    });

    test('deve renderizar a lista de repositórios após sucesso na API', async () => {
        render(<BoxRepo owner={TEST_OWNER} />);


        await act(async () => {
            jest.runAllTimers();
        });


        expect(screen.getByText('front-end-guide')).toBeInTheDocument();
        expect(screen.getByText('backend-api')).toBeInTheDocument();


        expect(screen.getByText('Ainda não há estatísticas disponíveis para este usuário.')).toBeInTheDocument();


        expect(screen.queryByText(`Buscando repositórios de "${TEST_OWNER}"...`)).not.toBeInTheDocument();
    });

    test('deve mostrar a mensagem de erro se a chamada da API falhar', async () => {

        mockAnalyzeUserRepos.mockRejectedValue(new Error('GitHub Error'));

        render(<BoxRepo owner={TEST_OWNER} />);

        await act(async () => {
            jest.runAllTimers();
        });


        expect(screen.getByText(/Erro ao pegar os repositórios/i)).toBeInTheDocument();

        expect(screen.queryByText('front-end-guide')).not.toBeInTheDocument();
    });

    test('deve navegar para a página de análise ao clicar em "Ver detalhes"', async () => {
        render(<BoxRepo owner={TEST_OWNER} />);

        await act(async () => {
            jest.runAllTimers();
        });

        const detailsButton = screen.getAllByRole('button', { name: /Ver detalhes/i })[0];

        fireEvent.click(detailsButton);


        const expectedPath = `/analysis/${TEST_OWNER}/front-end-guide`;

        expect(mockNavigate).toHaveBeenCalledWith(expectedPath, { state: { repo: mockReposData[0] } });
    });
});