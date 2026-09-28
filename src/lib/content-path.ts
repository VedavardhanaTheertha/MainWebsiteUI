export type ContentPathPart = string | number;

export function readContentPath(value: unknown, path: readonly ContentPathPart[]): unknown {
  return path.reduce<unknown>((current, part) => {
    if (typeof part === "number" && Array.isArray(current)) return current[part];
    if (typeof part === "string" && current !== null && typeof current === "object") {
      return (current as Record<string, unknown>)[part];
    }
    return undefined;
  }, value);
}