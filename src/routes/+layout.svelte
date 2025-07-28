<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';
	import '../app.css';
	import { Toaster } from '$lib/components/ui/sonner';

	let { children } = $props();
</script>
{@render children()}
<Toaster invert />
<ModeWatcher />
