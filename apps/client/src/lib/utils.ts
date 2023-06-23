export function debounce<T>(fn: (req: T) => void, interval: number) {
	let timeoutId: ReturnType<typeof setTimeout>;

	return (request: T) => {
		if (timeoutId) {
			clearTimeout(timeoutId);
		}

		timeoutId = setTimeout(() => {
			fn(request);
		}, interval);
	};
}
