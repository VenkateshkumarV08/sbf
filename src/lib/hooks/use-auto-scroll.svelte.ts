/** Use this on a vertically scrollable container to ensure that it automatically scrolls to the bottom of the content.
 *
 * ## Usage
 * ```svelte
 * <script lang="ts">
 *      import { UseAutoScroll } from '$lib/hooks/use-auto-scroll.svelte';
 *
 *      let { children } = $props();
 *
 *      const autoScroll = new UseAutoScroll();
 * </script>
 *
 * <div>
 *      <div bind:this={autoScroll.ref}>
 *          {@render children?.()}
 *      </div>
 *      {#if !autoScroll.isAtBottom}
 *          <button onclick={() => autoScroll.scrollToBottom()}>
 *              Scroll To Bottom
 *          </button>
 *      {/if}
 * </div>
 * ```
 */
export class UseAutoScroll {
	#ref = $state<HTMLElement>();
	#scrollY: number = $state(0);
	#userHasScrolled = $state(false);
	private lastScrollHeight = 0;

	// This sets everything up once #ref is bound
	set ref(ref: HTMLElement | undefined) {
		this.#ref = ref;

		if (!this.#ref) return;

		this.lastScrollHeight = this.#ref.scrollHeight;

		// start from bottom or start position
		this.#ref.scrollTo(0, this.#scrollY ? this.#scrollY : this.#ref.scrollHeight);

		this.#ref.addEventListener('scroll', () => {
			if (!this.#ref) return;

			this.#scrollY = this.#ref.scrollTop;

			this.disableAutoScroll();
		});

		window.addEventListener('resize', () => {
			this.scrollToBottom(true);
		});

		// should detect when something changed that effected the scroll height
		const observer = new MutationObserver(() => {
			if (!this.#ref) return;

			if (this.#ref.scrollHeight !== this.lastScrollHeight) {
				this.scrollToLastChild();
			}

			this.lastScrollHeight = this.#ref.scrollHeight;
		});

		observer.observe(this.#ref, { childList: true, subtree: true });
	}

	get ref() {
		return this.#ref;
	}

	get scrollY() {
		return this.#scrollY;
	}

	/** Checks if the container is scrolled to the bottom */
	get isAtBottom() {
		if (!this.#ref) return true;

		// Add 1px tolerance for rounding issues
		return this.#scrollY + this.#ref.offsetHeight >= this.#ref.scrollHeight - 1;
	}

	/** Disables auto scrolling until the container is scrolled back to the bottom */
	disableAutoScroll() {
		if (this.isAtBottom) {
			this.#userHasScrolled = false;
		} else {
			this.#userHasScrolled = true;
		}
	}

	/** Scrolls the container to the bottom */
	scrollToBottom(auto = false) {
		if (!this.#ref) return;

		// don't auto scroll if user has scrolled
		if (auto && this.#userHasScrolled) return;

		this.#ref.scrollTo(0, this.#ref.scrollHeight);
	}

	scrollToLastChild() {
		if (!this.#ref) return;
		// Great-grandchild
		const lastGreatGrandchild = this.#ref.lastElementChild?.lastElementChild?.lastElementChild;
		if (lastGreatGrandchild) {
			const childHeight = lastGreatGrandchild.scrollHeight || lastGreatGrandchild.clientHeight;
			const containerHeight = this.#ref.offsetHeight;
			
			lastGreatGrandchild.scrollIntoView({ behavior: "smooth" });
			
			// Only adjust scroll if the child is taller than the container
			if (childHeight + 80 > containerHeight) {
				// Scroll up a bit to show more of the top content
				setTimeout(() => {
					if (this.#ref) {
						const minScroll = 0;
						const targetScroll = this.#ref.scrollTop - 30;
						
						// Don't scroll past the top
						if (targetScroll >= minScroll) {
							this.#ref.scrollTop = targetScroll;
						} else {
							this.#ref.scrollTop = minScroll;
						}
					}
				}, 100);
			}
		} else {
			this.scrollToBottom();
		}
	}
}
