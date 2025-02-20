import { useEffect, useState } from "react";

/**
 * A hook that debounces a value by delaying updates.
 * @param value The value to debounce
 * @param delay The delay in milliseconds
 * @param immediate Whether to use the initial value immediately (defaults to false)
 * @returns The debounced value
 * @example
 * ```tsx
 * function SearchComponent() {
 *   const [searchTerm, setSearchTerm] = useState("");
 *   const debouncedSearch = useDebounce(searchTerm, 500);
 *
 *   useEffect(() => {
 *     // API call will only happen 500ms after the user stops typing
 *     searchApi(debouncedSearch);
 *   }, [debouncedSearch]);
 *
 *   return (
 *     <input
 *       type="text"
 *       value={searchTerm}
 *       onChange={(e) => setSearchTerm(e.target.value)}
 *     />
 *   );
 * }
 * ```
 */
export function useDebounce<T>(value: T, delay: number, immediate = false): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(
		immediate ? value : (undefined as T),
	);

	useEffect(() => {
		const handler = setTimeout(
			() => {
				setDebouncedValue(value);
			},
			immediate ? 0 : delay,
		);

		return () => {
			clearTimeout(handler);
		};
	}, [value, delay, immediate]);

	return debouncedValue;
}
