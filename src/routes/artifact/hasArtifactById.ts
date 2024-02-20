import { FastifyReply, FastifyRequest } from "fastify";
import { getStore } from "@netlify/blobs";
import { badRequest, notFound } from "@hapi/boom";
import { env } from "../../env.js";

type Request = FastifyRequest<{
	Querystring: { teamId?: string; slug?: string };
	Params: { id: string };
}>;

export const hasArtifactById = async (
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

	const { blobs } = await store.list();

	const foundBlob = blobs.find((blob) => blob.key === key);

	if (!foundBlob) {
		throw notFound("Artifact not found");
	}

	reply.code(200).send("OK");
};
