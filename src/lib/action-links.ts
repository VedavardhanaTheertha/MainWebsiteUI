export function formatActionMessage(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    if (!Object.hasOwn(values, key)) throw new Error(`Unknown action-message placeholder: ${key}`);
    return values[key];
  });
}

export function withActionParameters(destination: string, parameters: Record<string, string>) {
  const url = new URL(destination);
  for (const [key, value] of Object.entries(parameters)) url.searchParams.set(key, value);
  return url.toString();
}
