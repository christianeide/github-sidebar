import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig(({ mode }) => {
	const isTest = mode === 'test';
	const isDev = mode === 'development';
	const outDir = isDev ? 'dev' : 'build';
	const nodeEnv = isTest ? 'test' : isDev ? 'development' : 'production';

	if (isTest) {
		return {
			plugins: [
				react({
					include: /\.[jt]sx?$/,
					jsxRuntime: 'automatic',
				}),
			],
			define: {
				'process.env.NODE_ENV': JSON.stringify(nodeEnv),
				'process.env.npm_package_version': JSON.stringify(
					process.env.npm_package_version,
				),
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
		};
	}

	return {
		build: {
			outDir,
			sourcemap: isDev ? 'inline' : false,
			minify: isDev ? false : 'esbuild',
		},
		plugins: [
			react({
				include: /\.[jt]sx?$/,
				jsxRuntime: 'automatic',
			}),
			viteStaticCopy({
				targets: [{ src: 'images/logo_*', dest: 'images' }],
			}),
		],
		define: {
			'process.env.NODE_ENV': JSON.stringify(nodeEnv),
			'process.env.npm_package_version': JSON.stringify(
				process.env.npm_package_version,
			),
		},
	};
});
