import "typeface-roboto";
import "bootstrap/dist/css/bootstrap-reboot.min.css";

// Importing the Stopwatch class and the RunSafe utility from the "modules/stopwatch" module.
// The Stopwatch class is responsible for handling stopwatch functionality (start, stop, reset, etc.),
// while the RunSafe function ensures that the stopwatch is initialized safely when the HTML element is available.
import Stopwatch, { RunSafe } from "./modules/stopwatch";

// Selecting the HTML element with the id "stopwatch" where the stopwatch will be displayed.
// The `as HTMLElement` casting ensures TypeScript knows this element will be of type `HTMLElement`.
// If the element is not found, `element` will be `null`, which is handled by `RunSafe`.
const element: HTMLElement = document.getElementById(
  "stopwatch"
) as HTMLElement;

/**
 * Using the `RunSafe` utility to ensure that the stopwatch is only created if the `#stopwatch` element exists.
 * `RunSafe` checks the validity of the `element` before attempting to initialize the `Stopwatch`.
 *
 * If the element is present, a new `Stopwatch` instance is created with the name "Stopwatch" and is linked to the `element`.
 * The stopwatch instance will handle the logic for starting, pausing, and resetting the stopwatch, and will update the
 * inner text of the `element` with the elapsed time.
 */
RunSafe(element, () => new Stopwatch("Stopwatch", element));
