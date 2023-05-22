<script lang="ts">
	import type { LayoutData } from './$types';
	export let data: LayoutData;

	console.log('INIT', data);
</script>

<h1>{data?.post.title}</h1>
<p>{data?.post.content}</p>
