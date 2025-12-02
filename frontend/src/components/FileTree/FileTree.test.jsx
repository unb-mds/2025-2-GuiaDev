import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FileTree from './FileTree';



const mockTreeData = [
    {
        name: 'src',
        type: 'folder',
        children: [
            {
                name: 'index.js',
                type: 'file',
                path: 'src/index.js',
                meta: { badge: '50%' }
            },
            {
                name: 'styles',
                type: 'folder',
                meta: { badge: '75%' },
                children: [
                    { name: 'main.css', type: 'file', path: 'src/styles/main.css', meta: { badge: 80 } }
                ]
            }
        ]
    },
    {
        name: 'docs',
        type: 'folder',
        children: [
            { name: 'README.md', type: 'file', path: 'docs/README.md', meta: { badge: 100 } }
        ]
    }
];

const mockSummary = [
    { name: 'main.css', path: 'src/styles/main.css', status: 'Completo' }, // Status para arquivo
    { name: 'config', status: 'Parcial' }
];

jest.mock('./../../assets/folder.svg', () => 'folder-mock.svg');
jest.mock('./../../assets/docs.svg', () => 'docs-mock.svg');
jest.mock('./../../assets/chevron-right.svg', () => 'chevron-mock.svg');


describe('Componente FileTree', () => {

    const mockFileClick = jest.fn();

    beforeEach(() => {
        mockFileClick.mockClear();
    });

    test('deve renderizar a estrutura básica da árvore e o estado inicial colapsado', () => {
        render(<FileTree tree={mockTreeData} onFileClick={mockFileClick} summary={mockSummary} />);

        expect(screen.getByText('src')).toBeInTheDocument();
        expect(screen.getByText('docs')).toBeInTheDocument();

        expect(screen.queryByText('styles')).not.toBeVisible();

        expect(screen.getAllByLabelText(/Abrir pasta/i)).toHaveLength(2);
    });

    test('deve expandir e colapsar pastas ao clicar no chevron e no nome da pasta', () => {
        render(<FileTree tree={mockTreeData} onFileClick={mockFileClick} summary={mockSummary} />);

        const srcFolder = screen.getByText('src').closest('.tree-node');
        const chevronButton = srcFolder.querySelector('.chev');

        fireEvent.click(chevronButton);

        expect(screen.getByText('index.js')).toBeInTheDocument();
        expect(screen.getByText('styles')).toBeInTheDocument();
        expect(srcFolder.querySelector('.chev')).toHaveClass('open');

        fireEvent.click(screen.getByText('src'));

        expect(screen.queryByText('index.js')).not.toBeVisible();
        expect(srcFolder.querySelector('.chev')).not.toHaveClass('open');
    });

    test('deve calcular e renderizar o progresso baseado nas regras', async () => {
        render(<FileTree tree={mockTreeData} onFileClick={mockFileClick} summary={mockSummary} />);

        const stylesFolder = screen.getByText('styles').closest('.tree-node');
        const srcFolder = screen.getByText('src').closest('.tree-node');

        fireEvent.click(srcFolder.querySelector('.chev'));

        const stylesProgress = stylesFolder.querySelector('.node-percent');
        expect(stylesProgress).toHaveTextContent('75%');

        const indexProgress = screen.getByText('index.js').closest('.tree-node').querySelector('.node-percent');
        expect(indexProgress).toHaveTextContent('50%');

        const srcProgress = srcFolder.querySelector('.node-percent');
        expect(srcProgress).toHaveTextContent('63%');
    });

    test('deve aplicar o status "Completo" para README.md e "Parcial" para index.js', async () => {
        render(<FileTree tree={mockTreeData} onFileClick={mockFileClick} summary={mockSummary} />);

        const docsFolder = screen.getByText('docs').closest('.tree-node');
        fireEvent.click(docsFolder.querySelector('.chev'));

        const readmeStatus = screen.getByText('README.md').closest('.tree-node').querySelector('.node-status-wrap');
        expect(readmeStatus.querySelector('.status-label')).toHaveTextContent('Completo');
        expect(readmeStatus).toHaveClass('status Ativo');

        const srcFolder = screen.getByText('src').closest('.tree-node');
        fireEvent.click(srcFolder.querySelector('.chev')); // Abre src

        const indexStatus = screen.getByText('index.js').closest('.tree-node').querySelector('.node-status-wrap');
        expect(indexStatus.querySelector('.status-label')).toHaveTextContent('Parcial');
        expect(indexStatus).toHaveClass('status Parcial');
    });

    test('deve chamar a função onFileClick ao clicar em um arquivo, mas não em uma pasta', () => {
        render(<FileTree tree={mockTreeData} onFileClick={mockFileClick} summary={mockSummary} />);

        fireEvent.click(screen.getByText('src').closest('.tree-node').querySelector('.chev'));

        const indexFile = screen.getByText('index.js');
        const srcFolder = screen.getByText('src');

        fireEvent.click(indexFile);

        expect(mockFileClick).toHaveBeenCalledTimes(1);
        expect(mockFileClick).toHaveBeenCalledWith(mockTreeData[0].children[0]);

        fireEvent.click(srcFolder);

        expect(mockFileClick).toHaveBeenCalledTimes(1);

        expect(srcFolder.closest('.tree-node').querySelector('.chev')).not.toHaveClass('open');
    });
});