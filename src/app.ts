import fastify from "fastify";
import { env } from "./env.js";
import { badRequest, unauthorized } from "@hapi/boom";
import { hasArtifactById } from "./routes/artifact/hasArtifactById.js";
import { getArtifactById } from "./routes/artifact/getArtifactById.js";
import { storeArtifactById } from "./routes/artifact/storeArtifactById.js";
import { getArtifactEvents } from "./routes/artifact/getArtifactEvents.js";
import { getArtifactStatus } from "./routes/artifact/getArtifactStatus.js";
import { logger } from "./logger.js";

const app = fastify({
	logger,
	trustProxy: true,
});

const BYTE = 1;

const KILO_BYTE = 1000 * BYTE;

const MEGA_BYTE = 1000 * KILO_BYTE;

app.addContentTypeParser<Buffer>(
	"application/octet-stream",
	{ parseAs: "buffer", bodyLimit: 500 * MEGA_BYTE },
	// @ts-ignore
	async (request, payload) => payload,
);

app.addHook("onRequest", async (request) => {
	let authHeader = request.headers.authorization;

	authHeader = Array.isArray(authHeader) ? authHeader.join() : authHeader;

	if (!authHeader) {
		throw badRequest("Missing Authorization header");
	}

	const [, token] = authHeader.split("Bearer ");

	if (token !== env.TURBO_TOKEN) {
		throw unauthorized("Invalid authorization token");
	}
});

// /v8/artifacts/events
app.post("/v8/artifacts/events", getArtifactEvents);

// /v8/artifacts/status
app.get("/v8/artifacts/status", getArtifactStatus);

// /v8/artifacts/:id
app.head("/v8/artifacts/:id", hasArtifactById);
app.get("/v8/artifacts/:id", getArtifactById);
app.put("/v8/artifacts/:id", storeArtifactById);

export { app };
