/**
 * Timezone helpers for the per-user scheduled-push feature.
 *
 * Two responsibilities:
 *   1. Validate IANA timezone strings client-side and server-side.
 *   2. Convert a (local_date, local_time, IANA tz) triple into the UTC
 *      Date that wall-clock instant corresponds to.
 *
 * Implementation notes:
 *   - Relies on `Intl.DateTimeFormat` (built into V8 / WebKit / Node) to
 *     read the timezone offset. No external deps; works in workflow
 *     sandbox (deterministic for a given input).
 *   - The conversion handles DST transitions: we iterate twice because
 *     the offset itself depends on the wall time (spring-forward etc.).
 */

/**
 * Permissive IANA-name regex. Matches `Region/City` (e.g. America/New_York,
 * Europe/London) and the rare three-segment names
 * (America/Argentina/Buenos_Aires). Also accepts the special-case `UTC`
 * and `GMT`.
 *
 * This does not guarantee the zone exists — that final check goes through
 * `Intl.DateTimeFormat` which throws on unknown zones.
 */
const IANA_REGEX = /^(?:UTC|GMT|[A-Z][A-Za-z_-]+\/[A-Za-z_-]+(?:\/[A-Za-z_-]+)?)$/;

/**
 * Validate an IANA timezone name. Returns true iff `tz` looks well-formed
 * AND `Intl.DateTimeFormat` can construct a formatter for it.
 *
 * Use the regex first (cheap) and fall back to the Intl probe (expensive
 * but authoritative).
 */
export function isValidIanaTimezone(tz: unknown): tz is string {
  if (typeof tz !== 'string') return false;
  if (!IANA_REGEX.test(tz)) return false;
  try {
    // Intl.DateTimeFormat throws RangeError for unknown zones.
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/**
 * Compute the UTC offset (in minutes) of the given UTC instant when
 * observed in the named timezone. Positive for zones east of UTC.
 */
function timezoneOffsetMinutes(utc: Date, timeZone: string): number {
  // Format the UTC instant in the target zone, then re-parse those
  // wall-clock components as if they were UTC. The delta is the offset.
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  const parts = dtf.formatToParts(utc);
  const map: Record<string, string> = {};
  for (const p of parts) {
    if (p.type !== 'literal') map[p.type] = p.value;
  }
  const asUtc = Date.UTC(
    Number(map['year']),
    Number(map['month']) - 1,
    Number(map['day']),
    Number(map['hour']),
    Number(map['minute']),
    Number(map['second']),
  );
  return Math.round((asUtc - utc.getTime()) / 60000);
}

/**
 * Convert a (date, time, timezone) triple into the absolute UTC instant.
 *
 * @param localDate ISO `YYYY-MM-DD`.
 * @param localTime `HH:MM` or `HH:MM:SS` (24h).
 * @param timeZone  IANA timezone name. Pass `'UTC'` for users with no tz.
 *
 * DST behavior (deterministic, but note the convention):
 *
 *   - Spring-forward gap (e.g. 02:30 on a spring-forward day in
 *     America/New_York doesn't exist as a wall-clock time): the two-pass
 *     algorithm settles on the post-transition offset, so the result is
 *     the UTC instant you'd get by interpreting the input as if the new
 *     offset were already in effect.
 *   - Fall-back ambiguity (e.g. 01:30 on a fall-back day in
 *     America/New_York occurs twice — once at EDT, once an hour later
 *     at EST): returns the first occurrence.
 *
 * This is NOT the same as PostgreSQL's `AT TIME ZONE`, which picks the
 * later UTC instant in both cases.
 */
export function localTimeToUtc(localDate: string, localTime: string, timeZone: string): Date {
  // Validate inputs cheaply — better a clear error than a silent NaN Date.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(localDate)) {
    throw new Error(`localTimeToUtc: invalid localDate '${localDate}', expected YYYY-MM-DD`);
  }
  const timeMatch = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(localTime);
  if (!timeMatch) {
    throw new Error(`localTimeToUtc: invalid localTime '${localTime}', expected HH:MM[:SS]`);
  }
  const [y, mo, d] = localDate.split('-').map((s) => Number(s));
  const h = Number(timeMatch[1]);
  const mi = Number(timeMatch[2]);
  const s = timeMatch[3] ? Number(timeMatch[3]) : 0;

  // Step 1: pretend the wall time is UTC. This gives a candidate that's
  // off by one offset.
  const naive = new Date(Date.UTC(y!, mo! - 1, d!, h, mi, s));

  // Step 2: read the offset of that candidate in the target zone,
  // subtract.
  const offsetMin = timezoneOffsetMinutes(naive, timeZone);
  let utc = new Date(naive.getTime() - offsetMin * 60000);

  // Step 3: DST safety. The candidate's offset can be wrong if the wall
  // time crossed a DST transition. Re-read the offset at the corrected
  // instant and re-correct once. Converges in one extra step.
  const offsetMin2 = timezoneOffsetMinutes(utc, timeZone);
  if (offsetMin2 !== offsetMin) {
    utc = new Date(naive.getTime() - offsetMin2 * 60000);
  }
  return utc;
}
