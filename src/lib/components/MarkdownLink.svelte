<script lang="ts">
	import type { Snippet } from 'svelte';
	let { href, children, ...rest }: { href: string; children: Snippet; [key: string]: any } = $props();
</script>

<a {href} target="_blank" rel="noopener noreferrer" {...rest}>
	{@render children()}
</a>
