import { FastifyReply, FastifyRequest } from "fastify";
import { getStore } from "@netlify/blobs";
import { badRequest, notFound } from "@hapi/boom";
import { env } from "../../env.js";

type Request = FastifyRequest<{
	Querystring: { teamId?: string; slug?: string };
	Params: { id: string };
}>;

export const getArtifactById = async (
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

	const blob = await store.get(key, { type: "arrayBuffer" });

	if (!blob) {
		throw notFound("Artifact not found");
	}

	reply
		.header("Content-Type", "application/octet-stream")
		.header("Content-Length", blob.byteLength.toString())
		.header("Netlify-CDN-Cache-Control", "public, s-maxage=31536000, immutable")
		.header("Netlify-Vary", "header=Authorization,query=teamId")
		.status(200)
		.send(new Uint8Array(blob));
};
