import js from '@eslint/js';
import globals from 'globals';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import eslintConfigPrettier from 'eslint-config-prettier';

const projectIgnores = [
	'node_modules/**',
	'build/**',
	'coverage/**',
	'.vscode/**',
	'dist/**',
	'dist-archive/**',
	'dev/**',
	'testToken.js',
];

export default [
	{
		ignores: projectIgnores,
	},
	{
		files: ['**/*.{js,jsx}'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'module',
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
			globals: {
				...globals.browser,
				...globals.es2021,
				...globals.node,
				...globals.vitest,
				chrome: 'readonly',
				globalThis: 'readonly',
			},
		},
		settings: {
			react: {
				version: 'detect',
			},
		},
		plugins: {
			react: reactPlugin,
			'react-hooks': reactHooksPlugin,
		},
		rules: {
			...js.configs.recommended.rules,
			...reactPlugin.configs.recommended.rules,
			...reactHooksPlugin.configs.recommended.rules,
			...eslintConfigPrettier.rules,
			'react-hooks/immutability': 'off',
			'react-hooks/refs': 'off',
			'react-hooks/set-state-in-effect': 'off',
			'react/prop-types': 'off',
		},
	},
];
