import { app } from "./app.js";
import { env } from "./env.js";

app.listen({ port: env.PORT }, (err) => {
	if (err) {
		console.error(err);
		process.exit(1);
	}
});
