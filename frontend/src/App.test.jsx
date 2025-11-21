import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';



const mockUseLocation = jest.fn();


jest.mock('react-router-dom', () => ({

    useLocation: () => mockUseLocation(),


    Outlet: () => <div data-testid="mock-outlet">Conteúdo da Página</div>,
}));


jest.mock('./components/Header/Header.jsx', () => () => <div data-testid="mock-header">Header</div>);
jest.mock('./components/Sidebar/Sidebar.jsx', () => () => <div data-testid="mock-sidebar">Sidebar</div>);


describe('Componente App (Layout e Roteamento)', () => {

    beforeEach(() => {

        mockUseLocation.mockClear();
    });


    test('deve renderizar Header, SideBar e Outlet em caminhos normais (e.g., /home)', () => {


        mockUseLocation.mockReturnValue({ pathname: '/home' });

        render(<App />);


        expect(screen.getByTestId('mock-header')).toBeInTheDocument();
        expect(screen.getByTestId('mock-outlet')).toBeInTheDocument();


        expect(screen.getByTestId('mock-sidebar')).toBeInTheDocument();
    });


    test('não deve renderizar a SideBar na rota /login', () => {


        mockUseLocation.mockReturnValue({ pathname: '/login' });

        render(<App />);


        expect(screen.getByTestId('mock-header')).toBeInTheDocument();
        expect(screen.getByTestId('mock-outlet')).toBeInTheDocument();


        const sidebar = screen.queryByTestId('mock-sidebar');
        expect(sidebar).not.toBeInTheDocument();
    });


    test('deve renderizar a SideBar em outras rotas não excluídas (e.g., /analise)', () => {


        mockUseLocation.mockReturnValue({ pathname: '/analise' });

        render(<App />);


        expect(screen.getByTestId('mock-sidebar')).toBeInTheDocument();
    });
});