import { useEffect, useRef, useState } from "react";

/**
 * A custom hook that uses the Intersection Observer API to detect when an element enters or leaves the viewport
 *
 * @param options - Configuration options for the Intersection Observer
 * @param {number | number[]} [options.threshold=0] - A number or array of numbers between 0 and 1, indicating at what percentage of the target's visibility the observer's callback should be executed
 * @param {Element | null} [options.root=null] - The element that is used as the viewport for checking visibility of the target
 * @param {string} [options.rootMargin="0%"] - Margin around the root element
 * @param {boolean} [options.freezeOnceVisible=false] - If true, stops observing the element once it becomes visible
 * @param {boolean} [options.initialIsIntersecting=false] - Initial intersection state before the observer is initialized
 * @param {(isIntersecting: boolean, entry: IntersectionObserverEntry) => void} [options.onChange] - Callback function that is triggered when intersection changes
 *
 * @returns {IntersectionReturn} An array containing:
 * - ref: A function to attach to the target element
 * - isIntersecting: A boolean indicating if the element is currently intersecting
 * - entry: The IntersectionObserverEntry object
 *
 * The return value also supports object destructuring with properties: ref, isIntersecting, and entry
 *
 * @example
 * const [ref, isIntersecting, entry] = useIntersectionObserver({
 *   threshold: 0.5,
 *   freezeOnceVisible: true
 * });
 *
 * // Or using object destructuring:
 * const { ref, isIntersecting, entry } = useIntersectionObserver();
 *
 * @see https://usehooks-ts.com/react-hook/use-intersection-observer
 */
export function useIntersectionObserver({
	threshold = 0,
	root = null,
	rootMargin = "0%",
	freezeOnceVisible = false,
	initialIsIntersecting = false,
	onChange,
}: UseIntersectionObserverOptions = {}): IntersectionReturn {
	const [ref, setRef] = useState<Element | null>(null);

	const [state, setState] = useState<State>(() => ({
		isIntersecting: initialIsIntersecting,
		entry: undefined,
	}));

	const callbackRef = useRef<UseIntersectionObserverOptions["onChange"]>(undefined);

	callbackRef.current = onChange;

	const frozen = state.entry?.isIntersecting && freezeOnceVisible;

	// biome-ignore lint/correctness/useExhaustiveDependencies: copied code
	useEffect(() => {
		if (!ref) return;

		// * Ensure the browser supports the Intersection Observer API
		if (!("IntersectionObserver" in window)) return;

		// * Skip if frozen
		if (frozen) return;

		let unobserve: (() => void) | undefined;

		const observer = new IntersectionObserver(
			(entries: IntersectionObserverEntry[]): void => {
				const thresholds = Array.isArray(observer.thresholds)
					? observer.thresholds
					: [observer.thresholds];

				for (const entry of entries) {
					const isIntersecting =
						entry.isIntersecting &&
						thresholds.some(
							(threshold) => entry.intersectionRatio >= threshold,
						);

					setState({ isIntersecting, entry });

					if (callbackRef.current) {
						callbackRef.current(isIntersecting, entry);
					}

					if (isIntersecting && freezeOnceVisible && unobserve) {
						unobserve();
						unobserve = undefined;
					}
				}
			},
			{ threshold, root, rootMargin },
		);

		observer.observe(ref);

		return () => {
			observer.disconnect();
		};
	}, [
		ref,
		JSON.stringify(threshold),
		root,
		rootMargin,
		frozen,
		freezeOnceVisible,
	]);

	// ensures that if the observed element changes, the intersection observer is reinitialized
	const prevRef = useRef<Element | null>(null);

	useEffect(() => {
		if (
			!ref &&
			state.entry?.target &&
			!freezeOnceVisible &&
			!frozen &&
			prevRef.current !== state.entry.target
		) {
			prevRef.current = state.entry.target;
			setState({ isIntersecting: initialIsIntersecting, entry: undefined });
		}
	}, [ref, state.entry, freezeOnceVisible, frozen, initialIsIntersecting]);

	const result = [
		setRef,
		!!state.isIntersecting,
		state.entry,
	] as IntersectionReturn;

	// Support object destructuring, by adding the specific values.
	result.ref = result[0];
	result.isIntersecting = result[1];
	result.entry = result[2];

	return result;
}

type State = {
	isIntersecting: boolean;
	entry?: IntersectionObserverEntry;
};

type UseIntersectionObserverOptions = {
	root?: Element | Document | null;
	rootMargin?: string;
	threshold?: number | number[];
	freezeOnceVisible?: boolean;
	onChange?: (
		isIntersecting: boolean,
		entry: IntersectionObserverEntry,
	) => void;
	initialIsIntersecting?: boolean;
};

type IntersectionReturn = [
	(node?: Element | null) => void,
	boolean,
	IntersectionObserverEntry | undefined,
] & {
	ref: (node?: Element | null) => void;
	isIntersecting: boolean;
	entry?: IntersectionObserverEntry;
};
