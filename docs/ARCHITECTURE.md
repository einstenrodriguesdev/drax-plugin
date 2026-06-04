# Architecture

## Product Boundary

Drax Corp is the commercial organic-growth module. `conclave-cc` remains the internal enterprise source library. The commercial plugin consumes selected patterns through reviewed, versioned capabilities rather than copying the full agent corpus.

## Runtime Layers

1. Intake and qualification.
2. Canonical project artifacts.
3. Editorial and asset manifests.
4. Renderer adapters.
5. Publishing adapters.
6. Measurement and decision loop.

All adapters implement dry-run before live mode. A failed adapter never blocks export-manual mode.

## State Model

Markdown artifacts are the human-auditable source of truth in v1.0.0. Machine execution state may use JSON beside those artifacts, but it must never silently override the human-readable decision record.

## Environment Reuse

Existing ignored environment files can be referenced through `DRAX_ENV_PATH`. Secrets are not copied between repositories. Each runtime receives only the variables needed for its adapter.
