import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProgressBar from '../ProgressBar';

describe('Componente ProgressBar', () => {


    test('deve renderizar a barra com o label padrão e valor 50%', () => {
        render(<ProgressBar value={50} />);


        expect(screen.getByText('Progresso:')).toBeInTheDocument();

        expect(screen.getByText('50%')).toBeInTheDocument();


        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toHaveAttribute('aria-valuenow', '50');


        const progressFill = progressBar.querySelector('.progress-fill');
        expect(progressFill).toHaveStyle('width: 50%');
    });


    test.each([

        [100, '100', '100%'],
        [101, '100', '100%'],
        [0, '0', '0%'],
        [-5, '0', '0%'],
        ['85%', '85', '85%'],
        ['25', '25', '25%'],
        [null, '0', '?%'],
        [-1, '0', '?%'],
        ['?', '0', '?%'],
        ['abc', '0', '?%'],

    ])('deve lidar com o valor %s e exibir %s e preenchimento de %s', (inputValue, expectedAriaValue, expectedLabelValue) => {

        render(<ProgressBar value={inputValue} label="Documentação" />);

        const progressBar = screen.getByRole('progressbar');

        if (inputValue === null || inputValue === -1 || inputValue === '?' || (typeof inputValue === 'string' && isNaN(parseInt(inputValue)))) {

            expect(screen.getByText(expectedLabelValue)).toBeInTheDocument();
            expect(progressBar).toHaveAttribute('aria-valuenow', '0');
            expect(progressBar.querySelector('.progress-fill')).toHaveStyle('width: 0%');
        } else {

            expect(screen.getByText(expectedLabelValue)).toBeInTheDocument();
            expect(progressBar).toHaveAttribute('aria-valuenow', expectedAriaValue);
            expect(progressBar.querySelector('.progress-fill')).toHaveStyle(`width: ${expectedAriaValue}%`);
        }
    });

    test('deve usar o rótulo personalizado fornecido', () => {
        const customLabel = 'Conclusão';
        render(<ProgressBar value={75} label={customLabel} />);

        expect(screen.getByText(`${customLabel}:`)).toBeInTheDocument();

        expect(screen.getByText('75%')).toBeInTheDocument();
    });
});