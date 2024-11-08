/**
 * Utility functions for handling various operations.
 * Includes helper methods to parse enums and other general-purpose functionality.
 */
export const ents = Object.entries; // Alias for `Object.entries`, which retrieves key-value pairs of an object.

class Utils {
  /**
   * A generator function that parses an enum (or any object with string or number values)
   * and yields the values of the enum starting from the middle of the entries.
   * This is particularly useful when working with enums that might have reverse mappings
   * or when only the second half of the entries are relevant.
   *
   * @param _enum - The enum (or object) to parse. It should be an object with string or number values.
   *
   * @returns A generator that yields values from the second half of the enum's entries.
   *
   * @example
   * const sampleEnum = { A: 1, B: 2, C: 3, D: 4 };
   * for (const value of Utils.parseEnum(sampleEnum)) {
   *   console.log(value); // Outputs: 3, 4
   * }
   */
  static *parseEnum<T extends Record<string, string | number>>(
    _enum: T
  ): Generator<string | number, void, unknown> {
    // Retrieve all key-value pairs from the enum (or object).
    const entries: [string, string | number][] = ents(_enum).slice(
      ents(_enum).length / 2 // Take the second half of the enum entries
    );

    // Yield each value from the second half of the entries.
    for (const entry of entries) {
      yield entry[1]; // Yield the value part of the [key, value] pair
    }
  }
}

export default Utils; // Export the Utils class for external usage
