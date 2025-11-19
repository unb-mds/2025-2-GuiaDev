import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AnalysisPage from '../AnalysisPage.jsx';


const mockUseParams = jest.fn();
const mockUseLocation = jest.fn();

jest.mock('react-router-dom', () => ({

    useParams: () => mockUseParams(),
    useLocation: () => mockUseLocation(),
}));


jest.useFakeTimers();
jest.spyOn(React, 'useLayoutEffect').mockImplementation(React.useEffect);


jest.mock('../../components/Overview/Overview', () => () => <div data-testid="mock-overview">Overview Component</div>);
jest.mock('../../components/Overview/MetricsRepo', () => () => <div data-testid="mock-metrics">Metrics Component</div>);
jest.mock('../../components/Overview/Summary', () => () => <div data-testid="mock-summary">Summary Component</div>);
jest.mock('../../components/AnalysisDetails/Details', () => ({ owner, repo }) => (
    <div data-testid="mock-details">Details Component: {owner}</div>
));


describe('Componente AnalysisPage', () => {

    const testOwner = 'guia-dev';
    const testRepoObj = { name: 'frontend-app', description: 'Test project' };

    beforeEach(() => {
        jest.clearAllMocks();


        mockUseParams.mockReturnValue({ owner: testOwner, repo: testRepoObj.name });
        mockUseLocation.mockReturnValue({ state: { repo: testRepoObj } });


        jest.runOnlyPendingTimers();
    });


    test('deve renderizar a Visão Geral (Overview) por padrão e usar dados de URL', () => {
        render(<AnalysisPage />);


        expect(screen.getByText('Análise do Repositório')).toBeInTheDocument();


        expect(screen.getByTestId('mock-overview')).toBeInTheDocument();
        expect(screen.getByTestId('mock-metrics')).toBeInTheDocument();
        expect(screen.getByText('Visão Geral')).toHaveClass('active');


        expect(screen.queryByTestId('mock-details')).not.toBeInTheDocument();
    });

    test('deve trocar para Análise Detalhada ao clicar na aba', () => {
        render(<AnalysisPage />);

        const detailsTab = screen.getByText('Análise Detalhada');


        fireEvent.click(detailsTab);


        expect(detailsTab).toHaveClass('active');

        expect(screen.getByTestId('mock-details')).toBeInTheDocument();
        expect(screen.getByText(/Details Component: guia-dev/i)).toBeInTheDocument();


        expect(screen.queryByTestId('mock-overview')).not.toBeInTheDocument();
    });

    test('deve aplicar a classe "active" corretamente na troca de abas', () => {
        render(<AnalysisPage />);

        const generalTab = screen.getByText('Visão Geral');
        const detailsTab = screen.getByText('Análise Detalhada');


        expect(generalTab).toHaveClass('active');
        expect(detailsTab).not.toHaveClass('active');


        fireEvent.click(detailsTab);
        expect(generalTab).not.toHaveClass('active');
        expect(detailsTab).toHaveClass('active');
    });
});