import { Hono } from "hono";
import { logger } from "hono/logger";

import { Context as NetlifyContext } from "@netlify/functions";
import artifacts from "./routes/artifacts";
import admin from "./routes/admin";

const app = new Hono();

app.use(logger());

app.route("/v8/artifacts", artifacts);
app.route("/admin", admin);

export default async (req: Request, context: NetlifyContext) =>
	app.fetch(req, { context });
