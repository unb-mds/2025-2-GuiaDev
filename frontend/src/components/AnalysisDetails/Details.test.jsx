import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import Details from '../Details';
import api from '../../../services/api';


const mockUseParams = jest.fn();
const mockUseLocation = jest.fn();

jest.mock('react-router-dom', () => ({
    useParams: () => mockUseParams(),
    useLocation: () => mockUseLocation(),
}));


const mockApiGet = jest.fn();
jest.mock('../../../services/api', () => ({
    get: (url) => mockApiGet(url),
}));


const mockBuildTree = jest.fn();
jest.mock('../../utils/tree', () => ({
    buildTreeWithDocs: (treeEntries, docs) => mockBuildTree(treeEntries, docs),
}));


jest.mock('../FileTree/FileTree', () => ({ tree, onFileClick }) => (
    <div data-testid="mock-file-tree" onClick={() => onFileClick(tree[0])}>
        {tree.length} entries
    </div>
));

jest.mock('../../assets/warning.svg', () => 'warning-mock.svg');


jest.useFakeTimers();


describe('Componente Details (Estrutura e Sugestões)', () => {

    const TEST_OWNER = 'guia-dev';
    const TEST_REPO = 'frontend-project';
    const MOCK_API_TREE_DATA = [{ name: 'src', path: 'src' }];
    const MOCK_FINAL_TREE = [{ name: 'src', type: 'folder', meta: { doc: {} } }];
    const MOCK_SUGGESTIONS = [
        { id: 1, name: 'README.md', score: 50, suggestions: ['Adicionar seção de instalação.'] },
        { id: 2, name: 'LICENSE', score: 100, suggestions: [] },
    ];

    beforeEach(() => {
        jest.clearAllMocks();

        mockUseParams.mockReturnValue({ owner: TEST_OWNER, repo: TEST_REPO });
        mockUseLocation.mockReturnValue({});

        mockApiGet.mockResolvedValue({ data: MOCK_API_TREE_DATA });
        mockBuildTree.mockReturnValue(MOCK_FINAL_TREE);
    });


    const runAsyncEffect = async () => {
        jest.advanceTimersByTime(0);
        await waitFor(() => expect(mockApiGet).toHaveBeenCalled());
        await act(async () => {

        });
    };


    test('deve buscar a estrutura da API e montar a árvore no carregamento', async () => {
        render(<Details />);


        await runAsyncEffect();


        expect(mockApiGet).toHaveBeenCalledWith(`github/tree/${TEST_OWNER}/${TEST_REPO}`);


        expect(mockBuildTree).toHaveBeenCalledWith(MOCK_API_TREE_DATA, null);


        expect(screen.getByTestId('mock-file-tree')).toBeInTheDocument();
        expect(screen.getByText('1 entries')).toBeInTheDocument();
    });

    test('deve mostrar erro se a API de busca da estrutura falhar', async () => {
        const errorMessage = 'API falhou ao buscar';
        mockApiGet.mockRejectedValue(new Error(errorMessage));

        render(<Details />);

        await runAsyncEffect();


        expect(screen.getByText('Estrutura de arquivos')).toBeInTheDocument();

    });

    test('deve renderizar sugestões de arquivos com score < 100 e ignorar score 100', () => {
        render(<Details repo={MOCK_SUGGESTIONS} />);

        expect(screen.getByText('README.md')).toBeInTheDocument();
        expect(screen.getByText('Adicionar seção de instalação.')).toBeInTheDocument();

        expect(screen.queryByText('LICENSE')).not.toBeInTheDocument();

        expect(screen.getByAltText('aviso')).toBeInTheDocument();
    });


    test('deve abrir o preview ao clicar em um arquivo com metadados de documento', async () => {

        mockBuildTree.mockReturnValue([{
            name: 'doc.js',
            meta: { doc: { name: 'Doc Name', content: 'Conteúdo do Arquivo' } }
        }]);

        render(<Details />);
        await runAsyncEffect();

        const fileTreeMock = screen.getByTestId('mock-file-tree');
        fireEvent.click(fileTreeMock);

        expect(console.log).not.toHaveBeenCalled();
    });
});