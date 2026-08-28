const SUPPORTED_CONTENT_MODES = new Set(["real", "placeholder", "switchable"]);

/**
 * Normalizes an environment content mode into the variants that may be emitted.
 * Keeping this policy shared prevents the generator and verifier from drifting.
 */
export function describeContentMode(contentMode) {
  if (!SUPPORTED_CONTENT_MODES.has(contentMode)) {
    throw new Error(
      `Unsupported content_mode "${contentMode}" (expected real, placeholder, or switchable)`,
    );
  }

  return {
    contentMode,
    defaultVariant: contentMode === "placeholder" ? "placeholder" : "real",
    includesReal: contentMode !== "placeholder",
    includesPlaceholder: contentMode !== "real",
    switchable: contentMode === "switchable",
  };
}