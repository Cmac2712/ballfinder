import { defineEnvVars } from '@sveltejs/kit/env';

// Read from the environment at runtime (e.g. Vercel project env vars), not inlined at build.
// Each schema tolerates `undefined` so the app still builds when the vars aren't set.
export const variables = defineEnvVars({
	RESEND_API_KEY: {
		schema: (value) => value,
		description: 'Resend API key — https://resend.com/api-keys'
	},
	BALL_OWNER_EMAIL: {
		schema: (value) => value,
		description: 'Where "ball found" alerts are sent (placeholder for a per-ball owner lookup)'
	},
	EMAIL_FROM: {
		schema: (value) => value ?? 'onboarding@resend.dev',
		description: 'Verified sender address; defaults to Resend’s onboarding address'
	}
});
