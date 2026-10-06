import { json, error } from '@sveltejs/kit';
import { RESEND_API_KEY, BALL_OWNER_EMAIL, EMAIL_FROM } from '$app/env/private';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const { latitude, longitude, accuracy } = await request.json().catch(() => ({}));

	const apiKey = RESEND_API_KEY;
	// Placeholder recipient. A real app would look up the owner for the specific ball.
	const to = BALL_OWNER_EMAIL;
	const from = EMAIL_FROM;

	if (!apiKey || !to) {
		throw error(500, 'Email is not configured. Set RESEND_API_KEY and BALL_OWNER_EMAIL.');
	}

	const hasLocation = typeof latitude === 'number' && typeof longitude === 'number';

	const locationLine = hasLocation
		? `The finder shared their location: ${latitude}, ${longitude}` +
			(typeof accuracy === 'number' ? ` (±${Math.round(accuracy)}m)` : '') +
			`\nMap: https://www.google.com/maps?q=${latitude},${longitude}`
		: 'The finder chose not to share their location.';

	const res = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${apiKey}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			from,
			to,
			subject: 'Your golf ball has been found',
			text: `Good news — someone found your golf ball.\n\n${locationLine}\n`
		})
	});

	if (!res.ok) {
		throw error(502, `Failed to send email: ${await res.text()}`);
	}

	return json({ ok: true });
};
