<script lang="ts">
	import type { ChatBubbleProps } from './types';

	let { ref = $bindable(null), variant, timestamp, children, ...rest }: ChatBubbleProps = $props();
</script>

<div class="flex flex-col gap-1 max-w-[80%] data-[variant='sent']:place-self-end" data-variant={variant}>
	<div
		{...rest}
		bind:this={ref}
		class="group/chat-bubble flex flex-row place-items-end gap-2"
		data-variant={variant}
	>
		{@render children?.()}
	</div>
	{#if timestamp}
		<p class="text-xs text-muted-foreground px-2 text-right data-[variant='sent']:text-left" data-variant={variant}>
			{timestamp}
		</p>
	{/if}
</div>
