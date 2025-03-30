export default defineNuxtConfig({
	modules: [
		'@vueuse/nuxt',
		'@unocss/nuxt',
		'@nuxtjs/supabase',
	],

	ssr: false,

	vue: {
		compilerOptions: {
			isCustomElement: tag => tag.includes('-'),
		},
	},

	supabase: {
		redirectOptions: {
			login: '/sign-in',
			callback: '/',
			exclude: ['sign-in', '/sign-up', '/forgot-password', '/reset-password'],
		},
	},

	typescript: {
		typeCheck: true,
		shim: false,
	},

	css: [
		'@/assets/main.scss',
	],

	postcss: {
		plugins: {
			'autoprefixer': {},
			'@unocss/postcss': {},
		},
	},

	nitro: {
		esbuild: {
			options: {
				target: 'esnext',
			},
		},
		prerender: {
			crawlLinks: false,
			routes: ['/'],
		},
	},

	app: {
		head: {
			viewport: 'width=device-width, initial-scale=1.0',
			link: [
				{ rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
				{ rel: 'apple-touch-icon', sizes: '57x57', href: '/favicon-57x57.png' },
				{ rel: 'apple-touch-icon', sizes: '60x60', href: '/favicon-60x60.png' },
				{ rel: 'apple-touch-icon', sizes: '72x72', href: '/favicon-72x72.png' },
				{ rel: 'apple-touch-icon', sizes: '76x76', href: '/favicon-76x76.png' },
				{ rel: 'apple-touch-icon', sizes: '114x114', href: '/favicon-114x114.png' },
				{ rel: 'apple-touch-icon', sizes: '120x120', href: '/favicon-120x120.png' },
				{ rel: 'apple-touch-icon', sizes: '144x144', href: '/favicon-144x144.png' },
				{ rel: 'apple-touch-icon', sizes: '152x152', href: '/favicon-152x152.png' },
				{ rel: 'apple-touch-icon', sizes: '180x180', href: '/favicon-180x180.png' },
				{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
				{ rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
				{ rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
				{ rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicon-96x96.png' },
				{ rel: 'icon', type: 'image/png', sizes: '192x192', href: '/favicon-192x192.png' },
				{ rel: 'shortcut icon', type: 'image/x-icon', href: '/favicon.ico' },
				{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
			],
			meta: [
				{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
				{ name: 'description', content: 'Login system made with Nuxt3 and Nordhealth Design System' },
				{ name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
				{ name: 'msapplication-TileColor', content: '#ffffff' },
				{ name: 'msapplication-TileImage', content: '/favicon-144x144.png' },
				{ name: 'msapplication-config', content: '/browserconfig.xml' },
			],
		},
	},

	devtools: {
		enabled: true,
	},
})
