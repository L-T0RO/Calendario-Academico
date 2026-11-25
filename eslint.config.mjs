import js from '@eslint/js';
import globals from 'globals';

export default [
js.configs.recommended,
{
    files: ['src/**/*.js', 'test/**/*.js'],
    languageOptions: {
ecmaVersion: 2022,
sourceType: 'commonjs',
globals: {
        ...globals.node,
        ...globals.jest,
},
    },
    rules: {
'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
'no-console': 'off',
'eqeqeq': ['error', 'always'],
'curly': ['error', 'all'],
'prefer-const': 'warn',
    },
},
];