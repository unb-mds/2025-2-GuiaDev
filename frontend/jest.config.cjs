module.exports = {

    setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
    testEnvironment: 'jsdom',


    moduleNameMapper: {

        '\\.(css|less|scss|sass)$': '<rootDir>/jest-mocks/style-mock.js',
        '\\.(gif|ttf|eot|svg|png|jpg|jpeg)$': '<rootDir>/jest-mocks/file-mock.js',


    },


    transformIgnorePatterns: [
        '/node_modules/',

    ],


    testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
};