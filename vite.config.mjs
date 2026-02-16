import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
	const target = process.env.BUILD_TARGET;

	if (!['content', 'background'].includes(target)) {
		throw new Error(
			'Missing BUILD_TARGET. Use BUILD_TARGET=content or BUILD_TARGET=background.'
		);
	}

	const isDev = mode === 'development';
	const isContent = target === 'content';
	const isWatch = process.argv.includes('--watch');
	const outDir = isDev ? 'dev' : 'build';

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
			react({
				include: /\.[jt]sx?$/,
				jsxRuntime: 'classic',
			}),
			viteStaticCopy({
				targets: [
					{ src: 'manifest.json', dest: '.' },
					{ src: 'images/logo_*', dest: 'images' },
				],
			}),
		],
		define: {
			'process.env.NODE_ENV': JSON.stringify(
				isDev ? 'development' : 'production'
			),
			'process.env.npm_package_version': JSON.stringify(
				process.env.npm_package_version
			),
		},
	};
});
