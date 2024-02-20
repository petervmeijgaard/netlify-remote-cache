import { FastifyReply, FastifyRequest } from "fastify";
import { getStore } from "@netlify/blobs";
import { badRequest } from "@hapi/boom";
import { env } from "../../env.js";

type Request = FastifyRequest<{
	Querystring: { teamId?: string; slug?: string };
	Params: { id: string };
	Body: Buffer;
}>;

export const storeArtifactById = async (
	request: Request,
	reply: FastifyReply,
) => {
	const artifactId = request.params.id;
	const teamId = request.query.teamId ?? request.query.slug;

	if (!teamId) {
		throw badRequest("Query string should have required property 'teamId'");
	}

	const key = encodeURIComponent(artifactId);

	const store = getStore({
		siteID: env.NETLIFY_SITE_ID,
		token: env.NETLIFY_TOKEN,
		name: `artifacts-${encodeURIComponent(teamId)}`,
	});

	const blob = request.body;

	if (!blob) {
		throw badRequest("Invalid request");
	}

	await store.set(key, blob);

	reply.code(200).send("OK");
};
