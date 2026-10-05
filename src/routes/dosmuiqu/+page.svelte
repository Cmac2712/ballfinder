<script lang="ts">
	import { onMount } from 'svelte';

	type LocationState =
		| { status: 'requesting' }
		| { status: 'granted'; coords: GeolocationCoordinates }
		| { status: 'denied' }
		| { status: 'unsupported' }
		| { status: 'error'; message: string };

	let location = $state<LocationState>({ status: 'requesting' });

	function requestLocation() {
		if (!('geolocation' in navigator)) {
			location = { status: 'unsupported' };
			return;
		}

		location = { status: 'requesting' };
		navigator.geolocation.getCurrentPosition(
			(position) => {
				location = { status: 'granted', coords: position.coords };
			},
			(error) => {
				location =
					error.code === error.PERMISSION_DENIED
						? { status: 'denied' }
						: { status: 'error', message: error.message };
			},
			{ enableHighAccuracy: true, timeout: 10000 }
		);
	}

	// Geolocation only exists in the browser, so request it once the page has mounted.
	onMount(requestLocation);
</script>

<h1>dosmuiqu</h1>

{#if location.status === 'requesting'}
	<p>Requesting your location…</p>
{:else if location.status === 'granted'}
	<p>
		Your location: {location.coords.latitude.toFixed(5)}, {location.coords.longitude.toFixed(5)}
		(±{Math.round(location.coords.accuracy)}m)
	</p>
{:else if location.status === 'denied'}
	<p>Location permission was denied. Enable it in your browser settings, then try again.</p>
	<button onclick={requestLocation}>Try again</button>
{:else if location.status === 'unsupported'}
	<p>Your browser doesn't support location access.</p>
{:else}
	<p>Couldn't get your location: {location.message}</p>
	<button onclick={requestLocation}>Try again</button>
{/if}
