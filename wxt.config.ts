import { defineConfig } from 'wxt';

export default defineConfig({
	srcDir: 'src',
	imports: false,
	modules: ['@wxt-dev/module-react'],
	dev: {
		server: {
			port: 5115,
		},
	},
	manifest: {
		name: 'Github Sidebar',
		description:
			'Make shortcuts to repositories you frequently use on Github. Faster navigation and better control over your repositories.',
		permissions: ['storage', 'tabs', 'alarms'],
		host_permissions: ['https://github.com/*'],
		icons: {
			16: '/images/logo_16.png',
			32: '/images/logo_32.png',
			48: '/images/logo_48.png',
			128: '/images/logo_128.png',
		},
		web_accessible_resources: [
			{
				resources: ['*.png', 'assets/*'],
				matches: ['https://github.com/*'],
			},
		],
	},
	hooks: {
		'build:manifestGenerated': (_wxt, manifest) => {
			if (!manifest.content_scripts) {
				return;
			}

			manifest.content_scripts.sort((a, b) => {
				const aHasLoadVisibility = a.js?.some((js) =>
					js.includes('load-visibility'),
				);
				const bHasLoadVisibility = b.js?.some((js) =>
					js.includes('load-visibility'),
				);

				if (aHasLoadVisibility === bHasLoadVisibility) {
					return 0;
				}

				return aHasLoadVisibility ? -1 : 1;
			});

			for (const contentScript of manifest.content_scripts) {
				if (!contentScript.js) {
					continue;
				}

				contentScript.js.sort((a, b) => {
					const aIsLoadVisibility = a.includes('load-visibility');
					const bIsLoadVisibility = b.includes('load-visibility');

					if (aIsLoadVisibility === bIsLoadVisibility) {
						return 0;
					}

					return aIsLoadVisibility ? -1 : 1;
				});
			}
		},
	},
	vite: () => ({
		define: {
			'process.env.npm_package_version': JSON.stringify(
				process.env.npm_package_version,
			),
		},
	}),
});
