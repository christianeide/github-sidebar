import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
	plugins: [
		react({
			include: /\.[jt]sx?$/,
			jsxRuntime: 'automatic',
		}),
	],
	define: {
		'process.env.NODE_ENV': JSON.stringify('test'),
		'process.env.npm_package_version': JSON.stringify(
			process.env.npm_package_version,
		),
	},
	resolve: {
		alias: {
			'#imports': resolve(__dirname, '__mocks__/wxt-imports.js'),
			'~': resolve(__dirname, 'src'),
		},
	},
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./__mocks__/vitest.setup.js'],
		include: ['src/**/*.test.{js,jsx}'],
		clearMocks: true,
		coverage: {
			provider: 'v8',
			reporter: ['text', 'lcov'],
			include: ['src/**/*.{js,jsx}'],
		},
	},
});
