import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SideBar from './Sidebar';



const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));


let originalLocation;
let localStorageStore = {};


const locationMock = {
    _href: '/home',
    get href() { return this._href; },
    set href(url) { this._href = url; },
    pathname: '/home',
};


const localStorageMock = {
    getItem: jest.fn(key => localStorageStore[key] || null),
    setItem: jest.fn((key, value) => { localStorageStore[key] = value.toString(); }),
    removeItem: jest.fn(key => { delete localStorageStore[key]; }),
    clear: jest.fn(() => { localStorageStore = {}; }),
};


beforeAll(() => {

    originalLocation = window.location;
    delete window.location;
    window.location = locationMock;


    Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
        configurable: true,
        writable: true,
    });
});

afterAll(() => {

    window.location = originalLocation;
});


describe('Componente SideBar', () => {


    const localStorage = window.localStorage;

    beforeEach(() => {
        jest.clearAllMocks();
        localStorageStore = { authToken: 'test_token_123' };


        window.location.href = '/home';
    });



    test('deve renderizar o botão de toggle e estar inicialmente fechado', () => {
        render(<SideBar />);

        const toggleButton = screen.getByRole('button', { name: /Toggle sidebar/i });
        const sidebar = toggleButton.parentElement.querySelector('.sidebar-container');

        expect(toggleButton).toBeInTheDocument();
        expect(sidebar).not.toHaveClass('open');
    });

    test('deve abrir e fechar a sidebar ao clicar no botão de toggle', () => {
        render(<SideBar />);
        const toggleButton = screen.getByRole('button', { name: /Toggle sidebar/i });
        const sidebar = toggleButton.parentElement.querySelector('.sidebar-container');

        fireEvent.click(toggleButton);
        expect(sidebar).toHaveClass('open');

        fireEvent.click(toggleButton);
        expect(sidebar).not.toHaveClass('open');
    });



    test.each([
        ['Repositórios', '/home'],
        ['Aprendizado', '/aprendizado'],
    ])('deve navegar para %s ao clicar no link', (name, path) => {
        render(<SideBar />);

        const navLink = screen.getByText(name);

        fireEvent.click(navLink.closest('.btn-nav'));

        expect(mockNavigate).toHaveBeenCalledWith(path);
    });



    test('deve remover o token do localStorage e redirecionar para /login ao clicar em "Sair"', () => {

        expect(localStorage.getItem('authToken')).toBe('test_token_123');

        render(<SideBar />);

        const logoutButton = screen.getByText('Sair');

        fireEvent.click(logoutButton.closest('.btn-nav'));


        expect(localStorage.removeItem).toHaveBeenCalledWith('authToken');


        expect(window.location.href).toBe('/login');
    });
});