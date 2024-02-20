import pino from "pino";

const PINO_LEVEL_SEVERITY_MAP = {
	trace: "DEBUG",
	debug: "DEBUG",
	info: "INFO",
	warn: "WARNING",
	error: "ERROR",
	fatal: "CRITICAL",
} as const;

const logDestination = process.stdout;

export const logger = pino(
	{
		level: "info",
		messageKey: "message",
		redact: ["req.headers.authorization"],
		formatters: {
			level(label, level) {
				const severity =
					PINO_LEVEL_SEVERITY_MAP[label] || PINO_LEVEL_SEVERITY_MAP.info;

				return { severity, level };
			},
		},
	},
	logDestination,
);
