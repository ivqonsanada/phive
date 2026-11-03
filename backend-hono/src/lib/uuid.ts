/**
 * UUIDv7 (RFC 9562), monotonic within an isolate.
 *
 * Laravel ordered several lists by auto-increment id (requirements, messages). Here
 * the UUID is the primary key, so it has to sort in insertion order too: rows created
 * in the same millisecond share a timestamp, and the 12-bit `rand_a` field becomes a
 * counter to keep them in sequence.
 */
let lastMs = 0;
let counter = 0;

export function uuid7(now = Date.now()): string {
  if (now > lastMs) {
    lastMs = now;
    counter = crypto.getRandomValues(new Uint16Array(1))[0]! & 0x3ff;
  } else if (++counter > 0xfff) {
    lastMs += 1;
    counter = 0;
  }

  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let ms = lastMs;
  for (let i = 5; i >= 0; i--) {
    bytes[i] = ms & 0xff;
    ms = Math.floor(ms / 256);
  }
  bytes[6] = 0x70 | (counter >> 8);
  bytes[7] = counter & 0xff;
  bytes[8] = 0x80 | (bytes[8]! & 0x3f);

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Laravel's whereUuid(): anything else is a 404 before it reaches the database. */
export function isUuid(value: string): boolean {
  return UUID.test(value);
}
