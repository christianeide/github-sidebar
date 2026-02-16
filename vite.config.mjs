import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
	const isTest = mode === 'test';
	const target = process.env.BUILD_TARGET ?? 'content';

	const reactPlugin = react({
		include: /\.[jt]sx?$/,
		jsxRuntime: 'automatic',
	});

	const isDev = mode === 'development';
	const isContent = target === 'content';
	const isWatch = process.argv.includes('--watch');
	const outDir = isDev ? 'dev' : 'build';
	const nodeEnv = isTest ? 'test' : isDev ? 'development' : 'production';

	return {
		build: {
			outDir,
			emptyOutDir: isContent && !isWatch, // Clear out directory before building
			sourcemap: isDev ? 'inline' : false,
			minify: isDev ? false : 'esbuild',
			cssCodeSplit: false,
			lib: {
				entry: isContent
					? path.resolve(__dirname, 'src/content-script/index.jsx')
					: path.resolve(__dirname, 'src/background/background.js'),
				name: isContent
					? 'GithubSidebarContentScript'
					: 'GithubSidebarBackground',
				formats: ['iife'],
				fileName: () => (isContent ? 'content-script.js' : 'background.js'),
				cssFileName: 'style',
			},
			rollupOptions: {
				output: {
					assetFileNames: (assetInfo) => {
						if (assetInfo.name === 'style.css') {
							return 'style.css';
						}

						return '[name]-[hash][extname]';
					},
				},
			},
		},
		plugins: [
			reactPlugin,
			...(!isTest
				? [
						viteStaticCopy({
							targets: [
								{ src: 'manifest.json', dest: '.' },
								{ src: 'images/logo_*', dest: 'images' },
							],
						}),
					]
				: []),
		],
		define: {
			'process.env.NODE_ENV': JSON.stringify(nodeEnv),
			'process.env.npm_package_version': JSON.stringify(
				process.env.npm_package_version
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
});
