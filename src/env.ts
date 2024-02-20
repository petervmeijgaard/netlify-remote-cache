import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import "dotenv/config";

export const env = createEnv({
	server: {
		PORT: z.coerce.number().optional().default(8080),

		TURBO_TOKEN: z.string().min(1),

		NETLIFY_SITE_ID: z.string().min(1),
		NETLIFY_TOKEN: z.string().min(1),
	},

	runtimeEnv: process.env,

	emptyStringAsUndefined: true,
});
