import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FileTree from './FileTree.jsx';


const mockTreeData = [
    {
        name: 'src',
        type: 'folder',
        children: [
            {
                name: 'index.js',
                type: 'file',
                path: 'src/index.js',
                meta: { doc: { score: 50, exists: true }, badge: '50%' }
            },
            {
                name: 'styles',
                type: 'folder',
                meta: { badge: '75%' },
                children: [
                    {
                        name: 'main.css',
                        type: 'file',
                        path: 'src/styles/main.css',
                        meta: { doc: { score: 100, exists: true }, badge: 100 }
                    }
                ]
            }
        ]
    },
    {
        name: 'docs',
        type: 'folder',
        children: [
            { name: 'README.md', type: 'file', path: 'docs/README.md', meta: { doc: { score: 100, exists: true } } }
        ]
    }
];

const mockSummary = [
    { name: 'main.css', path: 'src/styles/main.css', status: 'Completo' },
];

jest.mock('./../../assets/folder.svg', () => 'folder-mock.svg');
jest.mock('./../../assets/docs.svg', () => 'docs-mock.svg');
jest.mock('./../../assets/chevron-right.svg', () => 'chevron-mock.svg');


describe('Componente FileTree', () => {

    const mockFileClick = jest.fn();

    beforeEach(() => {
        mockFileClick.mockClear();
    });


    test('deve renderizar a estrutura básica e ocultar o conteúdo interno', () => {
        render(<FileTree tree={mockTreeData} onFileClick={mockFileClick} summary={mockSummary} />);

        expect(screen.getByText('src')).toBeInTheDocument();

        expect(screen.getByText('styles')).not.toBeVisible();


        expect(screen.getAllByLabelText(/Abrir pasta/i)).toHaveLength(2);
    });


    test('deve expandir e colapsar pastas ao clicar no nome', () => {
        render(<FileTree tree={mockTreeData} onFileClick={mockFileClick} summary={mockSummary} />);

        const srcFolder = screen.getByText('src').closest('.tree-node');
        const chevronButton = srcFolder.querySelector('.chev');

        fireEvent.click(chevronButton);


        expect(screen.getByText('index.js')).toBeVisible();
        expect(screen.getByText('styles')).toBeVisible();


        fireEvent.click(screen.getByText('src'));

        expect(screen.getByText('index.js')).not.toBeVisible();
    });


    test('deve calcular e renderizar o progresso agregado nas pastas', async () => {
        render(<FileTree tree={mockTreeData} onFileClick={mockFileClick} summary={mockSummary} />);

        const srcFolder = screen.getByText('src').closest('.tree-node');

        fireEvent.click(srcFolder.querySelector('.chev'));

        const stylesProgress = screen.getByText('styles').closest('.tree-node').querySelector('.node-percent');
        expect(stylesProgress).toHaveTextContent('75%');


        const srcProgress = srcFolder.querySelector('.node-percent');
        expect(srcProgress).toHaveTextContent('63%');

        expect(screen.getByText('index.js').closest('.tree-node').querySelector('.node-percent')).toBeNull();
    });

    test('deve aplicar o status "Completo" para 100% e "Parcial" para 50%', async () => {
        render(<FileTree tree={mockTreeData} onFileClick={mockFileClick} summary={mockSummary} />);


        fireEvent.click(screen.getByText('docs').closest('.tree-node').querySelector('.chev'));
        fireEvent.click(screen.getByText('src').closest('.tree-node').querySelector('.chev'));
        fireEvent.click(screen.getByText('styles').closest('.tree-node').querySelector('.chev'));


        const cssStatusWrap = screen.getByText('main.css').closest('.tree-node').querySelector('.node-status-wrap');
        expect(cssStatusWrap).toHaveClass('status Ativo');
        expect(cssStatusWrap).toHaveTextContent('Completo');

        const indexStatusWrap = screen.getByText('index.js').closest('.tree-node').querySelector('.node-status-wrap');
        expect(indexStatusWrap).toHaveClass('status Parcial');
        expect(indexStatusWrap).toHaveTextContent('Parcial');
    });
});