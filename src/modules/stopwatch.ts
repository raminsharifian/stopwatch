import { TimeUnit } from "./enums";
import { ResMod } from "./types";
import Utils from "./utils";
import CryptoJS from "crypto-js";

/**
 * A Stopwatch class that allows users to start, pause, reset, and display elapsed time.
 * It can also save and load the state of the stopwatch using the browser's localStorage.
 */
class Stopwatch {
  private playingState: boolean = false; // Tracks whether the stopwatch is playing or paused
  private elapsedTimestamp: number = 0; // Stores the elapsed time in milliseconds
  private animationId: number = 0; // Stores the ID of the ongoing animation frame request for smooth updates

  /**
   * Constructor to initialize the stopwatch.
   *
   * @param name - The name of the stopwatch (typically used for identifying the stopwatch in localStorage).
   * @param element - The HTML element where the stopwatch's time will be displayed.
   * @param enableCache - Boolean indicating whether to load the stopwatch state from localStorage (default: true).
   * @param startTimestamp - The timestamp at which the stopwatch should start (default: 0).
   * @param statusKeybindings - Array of key codes that toggle play/pause when pressed (default: ["Space", "KeyP"]).
   * @param resetButton - The key code that resets the stopwatch (default: "KeyR").
   */
  constructor(
    private name: string,
    private element: HTMLElement,
    private enableCache: boolean = true,
    private startTimestamp: number = 0,
    private statusKeybindings: string[] = ["Space", "KeyP"],
    private resetButton: string = "KeyR"
  ) {
    this.init(startTimestamp); // Initialize the stopwatch with the given startTimestamp
  }

  /**
   * Runs a given callback function if the specified element is present in the DOM.
   * If the element is missing, it logs an error to the console.
   *
   * @param element - The HTML element to check.
   * @param callback - The callback function to execute.
   */
  static runSafe(element: HTMLElement, callback: Function): void {
    element ? callback() : console.error("Element not found.");
  }

  /**
   * Initializes the stopwatch, setting up the start time and state.
   * It either loads the saved state from localStorage or sets a new start time.
   *
   * @param from - The timestamp from which the stopwatch should start.
   */
  private init(from: number = 0): void {
    this.title = this.name; // Set the name as the title attribute of the element
    this.addEvents(); // Add event listeners for interactions (click, keypress, etc.)

    // If caching is enabled, load the saved state from localStorage
    if (this.enableCache) {
      this.loadState();
      this.content = this.parse(this.now - this.startTimestamp); // Display the parsed time
    } else {
      // Otherwise, calculate the start timestamp based on the current time
      this.startTimestamp = this.now - from;
      this.elapsedTimestamp = this.now - this.startTimestamp;
      this.content = this.parse(this.now - this.startTimestamp); // Display the parsed time
    }

    this.animate(); // Start the animation loop
  }

  /**
   * Adds event listeners to the stopwatch element for interaction.
   * Includes listeners for click (toggle start/pause) and keyboard input (for play/pause and reset).
   */
  private addEvents(): void {
    this.element.addEventListener("click", () => this.toggle()); // Toggle play/pause on click

    // Save state when the window is about to be unloaded
    window.addEventListener("beforeunload", () => this.saveState());

    // Handle keyPresses for play/pause or reset functionality
    window.addEventListener("keypress", (e: KeyboardEvent) => {
      if (e.code === this.resetButton) {
        this.reset(); // Reset the stopwatch if the reset button is pressed
      }

      this.statusKeybindings.forEach((kb: string) => {
        if (e.code === kb) {
          this.toggle(); // Toggle play/pause if the specified keybinding is pressed
        }
      });
    });
  }

  /**
   * Starts or resumes the stopwatch, and begins the animation loop.
   * It calculates the elapsed time based on the current timestamp.
   */
  private animate(): void {
    if (this.playingState) {
      this.elapsedTimestamp = this.now - this.startTimestamp; // Update elapsed time
      this.content = this.parse(this.elapsedTimestamp); // Update the display with the new time
      this.animationId = requestAnimationFrame(this.animate.bind(this)); // Request the next animation frame
    } else {
      cancelAnimationFrame(this.animationId); // Cancel the animation loop if the stopwatch is paused
    }
  }

  /**
   * Starts the stopwatch and begins the animation loop.
   */
  private play(): void {
    this.playingState = true; // Set the playing state to true
    this.startTimestamp = this.now - this.elapsedTimestamp; // Set the new start timestamp based on the elapsed time
    this.animate(); // Start the animation loop
  }

  /**
   * Pauses the stopwatch and stops the animation loop.
   */
  private pause(): void {
    this.playingState = false; // Set the playing state to false
  }

  /**
   * Toggles between play and pause states. Saves the state to localStorage after each toggle.
   */
  private toggle(): void {
    this.playingState ? this.pause() : this.play(); // Toggle the state based on the current state
    this.saveState(); // Save the current state to localStorage
  }

  /**
   * Resets the stopwatch to zero and saves the state.
   * The reset operation can only occur if the stopwatch is not playing.
   */
  private reset(): void {
    if (!this.playingState) {
      this.startTimestamp = this.now; // Set the new start timestamp to the current time
      this.elapsedTimestamp = 0; // Reset the elapsed time
      this.content = this.parse(0); // Update the display to show 0 time
      this.saveState(); // Save the reset state to localStorage
    }
  }

  /**
   * Saves the current state of the stopwatch to localStorage.
   * The state is stored as a base64-encoded string for security and compactness.
   */
  private saveState(): void {
    const __data = {
      e: this.elapsedTimestamp, // Store the elapsed time
    };
    window.localStorage.setItem(this.hash, btoa(JSON.stringify(__data))); // Encode and save to localStorage
  }

  /**
   * Loads the last saved state from localStorage and updates the stopwatch.
   * If no state is found, it will reload the page to initialize a fresh stopwatch.
   */
  private loadState(): void {
    const lastState: string | null = window.localStorage.getItem(this.hash);

    if (lastState !== null) {
      this.startTimestamp = this.now - parseInt(JSON.parse(atob(lastState)).e); // Calculate the start time based on saved state
      this.elapsedTimestamp = this.now - this.startTimestamp; // Set the elapsed time
      return; // State loaded successfully, no need to reload
    }

    this.saveState(); // No saved state, create a fresh state
    window.location.reload(); // Reload the page to initialize the stopwatch
  }

  /**
   * Calculates the quotient and remainder of a given time and unit.
   * This is used to break down the timestamp into time units (hours, minutes, seconds, etc.).
   *
   * @param time - The current timestamp in milliseconds.
   * @param unit - The unit to calculate (milliseconds, seconds, minutes, etc.).
   *
   * @returns An object containing the quotient (res) and remainder (mod).
   */
  private calc(time: number, unit: number): ResMod {
    return {
      res: Math.floor(time / unit), // Quotient (integer division)
      mod: time % unit, // Remainder
    };
  }

  /**
   * Parses the given timestamp into a human-readable format (e.g., "00:05:23.456").
   * It iterates over each time unit (hours, minutes, seconds, milliseconds) and formats accordingly.
   *
   * @param timestamp - The timestamp to format, in milliseconds.
   *
   * @returns A formatted time string.
   */
  private parse(timestamp: number): string {
    let data: string = "";
    // Iterate over all possible time units
    for (const unit of Utils.parseEnum(TimeUnit)) {
      const resMod: ResMod = this.calc(timestamp, unit as number); // Calculate quotient and remainder
      const paddedResult = this.padZero(
        resMod.res,
        unit === TimeUnit.Milliseconds ? 3 : undefined // Special padding for milliseconds (3 digits)
      );
      timestamp -= resMod.res * (unit as number); // Subtract the calculated time portion
      const separator =
        unit === TimeUnit.Seconds
          ? "."
          : unit === TimeUnit.Milliseconds
          ? ""
          : ":"; // Use different separators for seconds, milliseconds, and other units
      data += `${paddedResult}${separator}`; // Add the formatted result to the output string
    }
    return data;
  }

  /**
   * Pads a number with leading zeroes to ensure it has the specified number of digits.
   *
   * @param number - The number to pad.
   * @param prefixAmount - The number of digits to ensure (default is 2).
   *
   * @returns A zero-padded string representation of the number.
   */
  private padZero(number: number, prefixAmount: number = 2): string {
    const stringified: string = String(number);
    return stringified.padStart(prefixAmount, "0"); // Pad with leading zeroes to the required length
  }

  /**
   * Gets the current timestamp in milliseconds (since Unix epoch).
   *
   * @returns The current timestamp.
   */
  private get now(): number {
    return new Date().getTime();
  }

  /**
   * Gets a unique hash value based on the stopwatch's name.
   * This hash is used for identifying the stopwatch's state in localStorage.
   *
   * @returns A base64-encoded MD5 hash of the stopwatch's name.
   */
  private get hash(): string {
    return CryptoJS.MD5(this.name).toString(CryptoJS.enc.Base64); // Generate a hash from the name and return as base64
  }

  /**
   * Sets the content of the stopwatch element (i.e., updates the time displayed).
   *
   * @param value - The formatted time string to display.
   */
  private set content(value: string) {
    this.element.textContent = value; // Update the text content of the element
  }

  /**
   * Sets the title attribute of the stopwatch element.
   *
   * @param value - The title to set.
   */
  private set title(value: string) {
    this.element.setAttribute("name", value); // Set the title attribute of the element
  }
}

export const RunSafe = Stopwatch.runSafe;

export default Stopwatch;
