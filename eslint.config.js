import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    { ignores: ['dist', 'node_modules'] },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['**/*.ts'],
        languageOptions: { globals: globals.browser },
        rules: {
            eqeqeq: 'error',
            'no-console': 'warn',
            '@typescript-eslint/consistent-type-imports': 'error',
        },
    },
    prettier,
);
