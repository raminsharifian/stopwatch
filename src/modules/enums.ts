/**
 * Enum representing time units in milliseconds.
 * Each time unit corresponds to its duration in milliseconds, which is useful for time calculations
 * and conversions when dealing with time intervals in a stopwatch, timer, or other time-based applications.
 */
enum TimeUnit {
  Hours = 3_600_000,
  Minutes = 60_000,
  Seconds = 1_000,
  Milliseconds = 1,
}

export { TimeUnit };
