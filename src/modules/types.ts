/**
 * The `ResMod` type represents a result and a remainder when dividing a time value by a given time unit.
 * It is typically used to break down a timestamp into multiple time units, like hours, minutes, seconds, and milliseconds.
 *
 * The `res` property holds the quotient (the result of the division), and the `mod` property holds the remainder (the leftover time after division).
 * This is useful when parsing or formatting time intervals into units like hours, minutes, or seconds.
 */
type ResMod = {
  res: number;
  mod: number;
};

export type { ResMod };
