<script lang="ts">
	let consent = $state(false);
	let status = $state<'idle' | 'locating' | 'sending' | 'sent' | 'error'>('idle');
	let message = $state('');

	function getPosition(): Promise<GeolocationPosition> {
		return new Promise((resolve, reject) => {
			if (!('geolocation' in navigator)) {
				reject(new Error('Location is not supported by this browser.'));
				return;
			}
			navigator.geolocation.getCurrentPosition(resolve, reject, {
				enableHighAccuracy: true,
				timeout: 10000
			});
		});
	}

	async function alertOwner() {
		status = 'idle';
		message = '';

		let body: Record<string, number> = {};
		let locationSkipped = false;

		status = 'locating';
		try {
			const pos = await getPosition();
			body = {
				latitude: pos.coords.latitude,
				longitude: pos.coords.longitude,
				accuracy: pos.coords.accuracy
			};
		} catch {
			// If we can't get a location, still alert the owner — just without it.
			locationSkipped = true;
		}

		status = 'sending';
		try {
			const res = await fetch('/dosmuiqu/notify', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			if (!res.ok) throw new Error(await res.text());
			status = 'sent';
			message = locationSkipped
				? 'thank you'
				: 'thank you';
		} catch (err) {
			status = 'error';
			message = `Couldn't alert the owner: ${(err as Error).message}`;
		}
	}

	alertOwner();
</script>

<img src="https://i.pinimg.com/originals/2a/2f/a0/2a2fa0db3179d4b4ec39d1a8a1eeda7d.jpg" alt="" width="500">

{#if status === 'locating'}
	<p>Getting your location…</p>
{:else if status === 'sending'}
	<p>Sending…</p>
{:else if status === 'sent'}
	<p>{message}</p>
{:else if status === 'error'}
	<p>{message}</p>
{/if}
