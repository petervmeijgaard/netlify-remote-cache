import { FastifyReply, FastifyRequest } from "fastify";

export const getArtifactStatus = (
	request: FastifyRequest,
	reply: FastifyReply,
) => {
	reply.status(200).send({ status: "enabled" });
};
