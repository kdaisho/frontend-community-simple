<script lang="ts">
	import type { LayoutData } from './$types';

	export let data: LayoutData;

	console.log('==>', data);
</script>

<h1>TODO</h1>

{#each data.todos as { task, completed }}
	<p>{task}</p>
	<p>{completed}</p>
{/each}
