import adapter from '@sveltejs/adapter-auto';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { setupSocket } from './src/lib/server/socket.ts';

const webSocketServer = {
	name: 'webSocketServer',
	configureServer(server: any) {
		if (server.httpServer) {
			setupSocket(server.httpServer);
		}
	}
};

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter()
		}),
		webSocketServer
	],
	server: {
		host: true
	}
});
