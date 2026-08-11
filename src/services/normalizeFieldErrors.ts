/**
 * Turns the API's validation-error payload into the shape screens actually use.
 *
 * The backend's validate middleware emits an ARRAY:
 *
 *   errors: [{ field: 'password', message: 'Password must be at least 8...' }]
 *
 * but every form reads errors by field name (`fieldErrors.password`). Assigning
 * the array straight through leaves that lookup permanently `undefined`, so
 * validation failures render as nothing at all - the user taps submit, the
 * request completes, and the screen appears to do nothing.
 *
 * Normalising here means each screen keeps its simple `fieldErrors.x` lookup
 * and neither client has to know the wire format.
 */
export function normalizeFieldErrors(raw: unknown): Record<string, string> | undefined {
  if (!raw) return undefined;

  // Already keyed by field - pass through.
  if (!Array.isArray(raw)) {
    return typeof raw === 'object' ? (raw as Record<string, string>) : undefined;
  }

  const normalized: Record<string, string> = {};

  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;

    const item = entry as { field?: string; param?: string; path?: string; message?: string; msg?: string };
    // `field` is what this backend sends; `param`/`path` cover raw
    // express-validator output in case a route ever bypasses the middleware.
    const key = item.field ?? item.param ?? item.path;
    const value = item.message ?? item.msg;

    // Keep the first message per field - that's the one closest to what the
    // user did wrong, and forms only have room to show one.
    if (key && value && !normalized[key]) {
      normalized[key] = value;
    }
  }

  return Object.keys(normalized).length > 0 ? normalized : undefined;
}
