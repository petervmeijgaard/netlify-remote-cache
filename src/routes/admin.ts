import { bearerAuth } from "hono/bearer-auth";
import { type Context, Hono, type Next } from "hono";
import { env } from "../env";
import { getStore } from "@netlify/blobs";

const app = new Hono();

app.use("/*", (c: Context, next: Next) => {
	const { ADMIN_TOKEN: token } = env;

	if (!token) throw new Error("Missing token");

	return bearerAuth({ token })(c, next);
});

app.delete("/prune/:teamId", async (c) => {
	const { teamId } = c.req.param();

	const store = getStore(`artifacts-${encodeURIComponent(teamId)}`);

	const { blobs } = await store.list();

	const deletePromises = blobs.map(async ({ key }) => {
		await store.delete(key);
	});

	await Promise.all(deletePromises);

	return c.text("OK", 200);
});


export default app;
