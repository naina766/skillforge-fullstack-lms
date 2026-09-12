/**
 * Escapes special regex metacharacters in user input to prevent Regex Injection (ReDoS / syntax errors).
 */
export function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
