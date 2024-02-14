import { handle } from 'https://deno.land/x/hono@v4.0.1/adapter/netlify/mod.ts';
import type { Env as NetlifyEnv } from 'https://deno.land/x/hono@v4.0.1/adapter/netlify/mod.ts';
import { Hono } from 'https://deno.land/x/hono@v4.0.1/mod.ts';
import type { Context, Next } from 'https://deno.land/x/hono@v4.0.1/mod.ts';
import { env } from 'https://deno.land/x/hono@v4.0.1/helper.ts';
import { getStore } from "https://esm.sh/@netlify/blobs";
import { bearerAuth } from 'https://deno.land/x/hono@v4.0.1/middleware.ts';

const app = new Hono<NetlifyEnv>();

const bearerEnvAuth = (c: Context, next: Next) => {
	const { TURBO_TOKEN } = env<{ TURBO_TOKEN: string | undefined }>(c, 'deno');

	if (!TURBO_TOKEN) {
		throw new Error('Missing token');
	}

	return bearerAuth({ token: TURBO_TOKEN })(c, next);
};

app.use('/v8/artifacts/*', bearerEnvAuth);

app.post('/v8/artifacts', (c) => {
	// todo: implement this
	return c.text('Hello Hono!');
});

app.post('/v8/artifacts/events', (c) => {
	// todo: implement this
	return c.text('Hello Hono!');
});

app.get('/v8/artifacts/status', (c) => {
	// todo: implement this
	return c.text('Hello Hono!');
});

app.on('HEAD', '/v8/artifacts/:hash', async (c) => {
	const { hash } = c.req.param();
	const { teamId } = c.req.query();

	if (!hash || !teamId) {
		return c.text("Invalid request", 400);
	}

	const key = encodeURIComponent(hash);
	const store = getStore(`artifacts-${encodeURIComponent(teamId)}`);

	const hasBlob = await store.get(key);

	if (!hasBlob) {
		return c.text("Not found", 404);
	}

	return c.text("OK");
});

app.get('/v8/artifacts/:hash', async (c) => {
	const { hash } = c.req.param();
	const { teamId } = c.req.query();

	if (!hash || !teamId) {
		return c.text("Invalid request", 400);
	}

	const key = encodeURIComponent(hash);
	const store = getStore(`artifacts-${encodeURIComponent(teamId)}`);

	const blob = await store.get(key, { type: 'arrayBuffer' });

	if (!blob) {
		return c.text("Not found", 404);
	}

	const headers = new Headers();

	headers.set('Content-Type', 'application/octet-stream');
	headers.set('Content-Length', blob.byteLength.toString());
	headers.set("Netlify-CDN-Cache-Control", "public, s-maxage=31536000, immutable");
	headers.set("Netlify-Vary", "header=Authorization,query=teamId");

	return c.body(blob, { headers });
});

app.put('/v8/artifacts/:hash', async (c) => {
	const { hash } = c.req.param();
	const { teamId } = c.req.query();

	if (!hash || !teamId) {
		return c.text("Invalid request", 400);
	}

	const key = encodeURIComponent(hash);
	const store = getStore(`artifacts-${encodeURIComponent(teamId)}`);

	const blob = await c.req.arrayBuffer();

	if (!blob) {
		return c.text("No content", 400);
	}

	await store.set(key, blob);

	return c.text("OK");
});


export default handle(app);
