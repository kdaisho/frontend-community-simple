<script lang="ts">
	import type { LayoutData } from './$types';

	export let data: LayoutData;
</script>

{#each data.todos as { task, completed }}
	<p>{task}</p>
	<p>{completed}</p>
{/each}
