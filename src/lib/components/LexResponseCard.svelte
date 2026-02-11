<script lang="ts">
	import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "$lib/components/ui/card";
	import { Button } from "$lib/components/ui/button";
	import type { ImageResponseCard } from "$lib/services/lex";

	interface Props {
		card: ImageResponseCard;
		onButtonClick?: (value: string, text: string) => void;
	}

	let { card, onButtonClick }: Props = $props();
</script>

<Card class="w-full overflow-hidden">
	{#if card.imageUrl}
		<div class="w-full h-48 overflow-hidden">
			<img 
				src={card.imageUrl} 
				alt={card.title} 
				class="w-full h-full object-cover"
			/>
		</div>
	{/if}
	
	<CardHeader class="@container-normal">
		<CardTitle class="text-lg">{card.title}</CardTitle>
		{#if card.subtitle}
			<CardDescription class=" pt-3 mt-1">{card.subtitle}</CardDescription>
		{/if}
	</CardHeader>
	
	{#if card.buttons && card.buttons.length > 0}
		<CardFooter class="flex flex-col gap-2 pt-3">
			{#each card.buttons as button}
				<Button
					onclick={() => onButtonClick?.(button.value, button.text)}
					variant="outline"
					class="w-full"
				>
					{button.text}
				</Button>
			{/each}
		</CardFooter>
	{/if}
</Card>
