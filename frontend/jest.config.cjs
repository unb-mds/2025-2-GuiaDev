module.exports = {
    // O Jest deve procurar arquivos de teste com estas extensões
    setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
    testEnvironment: 'jsdom',

    // Mapeia importações não-JS (como CSS) para o nosso mock vazio
    moduleNameMapper: {
        // Para qualquer arquivo que termine em .css, .less, .scss, etc.
        '\\.(css|less|scss|sass)$': '<rootDir>/jest-mocks/style-mock.js',

        // Mapeamento para o módulo 'api' (se você usou caminhos relativos na importação, 
        // é bom ter um alias, embora possa não ser estritamente necessário agora)
        // '^@/(.*)$': '<rootDir>/src/$1', 
    },

    // Padrões que o Jest deve ignorar (geralmente node_modules)
    transformIgnorePatterns: [
        '/node_modules/',
        // Adicione padrões para outras pastas que você não quer transformar
    ],

    // Pastas onde o Jest deve procurar arquivos de teste
    testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
};