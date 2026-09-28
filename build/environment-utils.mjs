const SUPPORTED_CONTENT_MODES = new Set(["real", "placeholder", "switchable"]);

/**
 * Normalizes an environment content mode into the variants that may be emitted.
 * Keeping this policy shared prevents the generator and verifier from drifting.
 */
export function describeContentMode(contentMode, configuredDefaultVariant) {
  if (!SUPPORTED_CONTENT_MODES.has(contentMode)) {
    throw new Error(
      `Unsupported content_mode "${contentMode}" (expected real, placeholder, or switchable)`,
    );
  }

  const defaultVariant = configuredDefaultVariant ??
    (contentMode === "placeholder" ? "placeholder" : "real");
  if (defaultVariant !== "real" && defaultVariant !== "placeholder") {
    throw new Error(
      `Unsupported default_variant "${defaultVariant}" (expected real or placeholder)`,
    );
  }
  if (contentMode !== "switchable" && defaultVariant !== contentMode) {
    throw new Error(`default_variant can only be configured for switchable content_mode`);
  }

  return {
    contentMode,
    defaultVariant,
    includesReal: contentMode !== "placeholder",
    includesPlaceholder: contentMode !== "real",
    switchable: contentMode === "switchable",
  };
}