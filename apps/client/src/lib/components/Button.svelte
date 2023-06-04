<button on:click>
	<slot>Empty</slot>
</button>

<style>
	button {
		background-color: #fff;
		border: 1px solid #ccc;
		border-radius: 4px;
		color: #333;
		font-size: 1rem;
		padding: 0.5rem 1rem;
		white-space: nowrap;
	}

	button:hover {
		cursor: pointer;
	}
</style>
