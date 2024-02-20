import { FastifyReply, FastifyRequest } from "fastify";

export const getArtifactEvents = (
	request: FastifyRequest,
	reply: FastifyReply,
) => {
	reply.status(200).send({});
};
