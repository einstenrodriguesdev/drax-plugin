# Repository Topology

Date: 2026-06-06
Owner: Drax technical operations
Status: four-surface plugin topology

This document defines the Drax plugin operating surfaces. The product now has four surfaces that must not cross responsibilities.

## Four Surfaces

| Surface | Local path | Git status | Responsibility | Customer-visible? |
|---|---|---:|---|---:|
| `drax-plugin` | `/home/conclave/drax/drax-plugin` | Git repo, remote `git@github.com:einstenrodriguesdev/drax-plugin.git` | Released, versioned plugin product. Customers install this. | Yes |
| `drax-dev` | `/home/conclave/drax/drax-dev` | Git repo, local factory clone with push disabled | Pre-release plugin factory where the next version is built and tested before promotion. | No |
| `drax-recursive` | `/home/conclave/drax/drax-recursive` | Operating workspace, not product source | Drax running on itself as its first customer. Holds founder artifacts and recursive validation state. | No |
| `conclave` | `/home/conclave/conclave-cc` | Internal source library | Operator machine and HR role factory. New agent roles are created here, then vendored into the plugin only after review. | No |

The existing public site repository is outside this plugin factory flow. The plugin must attach an editorial blog surface to a customer site without depending on the Drax public site repository.

## Non-Crossing Rule

`drax-plugin` ships frozen product code, templates, schemas, and vendored worker definitions only.

`drax-dev` may contain unfinished implementation work, failed tests, temporary branches, generated test assets, and clean-environment experiments. It must not contain customer artifacts, live sessions, `.env` files, credentials, package output, render output, or production tags.

`drax-recursive` contains Drax's own founder workspace artifacts. It must be updated through the same customer upgrade path that an external customer uses. Product source does not get edited there.

`conclave` remains internal. The HR path `/home/conclave/conclave-cc/agents/hr.md` is not part of the customer runtime and must never be required on a customer machine.

## Promotion Flow

```text
build next version in drax-dev
  -> run package and baseline validators
  -> prove install and runtime in disposable clean container drax-clean
  -> record evidence
  -> promote reviewed patch into drax-plugin
  -> tag and release from drax-plugin only
  -> customer updates installed plugin through the supported upgrade path
  -> drax-recursive updates as a customer workspace, preserving founder artifacts
```

No path enters `drax-plugin` until it has passed in `drax-dev` and in a disposable clean container. The clean container is the zero-user proof surface. It must start without hidden local state, without `/home/conclave/conclave-cc`, and without customer workspace artifacts.

## Why `drax-dev` Is Not A Duplicate Dev Repo

Earlier topology warnings rejected loose duplicate development repositories because they create unclear promotion authority and accidental production drift.

`drax-dev` is different. It is the plugin pre-release factory with a narrower risk profile:

- it builds the next installable plugin version, not a parallel production source of truth;
- it has push disabled for this task;
- it carries no production tags;
- it carries no customer artifacts;
- promotion still happens by reviewed patch into `drax-plugin`;
- release authority remains only in `drax-plugin`.

## Surface Responsibilities

### `drax-plugin`

Owns:

- production package metadata;
- Codex plugin source;
- installer and launcher code;
- baseline templates;
- vendored V1 marketing worker definitions;
- package and baseline validators;
- schemas;
- release documentation;
- production tags.

Does not own:

- founder workspace artifacts;
- Stripe or Pagar.me keys;
- live browser sessions;
- generated renders;
- exploratory agent creation;
- pre-release experiments.

### `drax-dev`

Owns:

- next-version implementation work;
- package dry runs;
- blog automation implementation;
- access-token gate stubs;
- clean install tests;
- disposable runtime experiments;
- evidence before promotion.

Does not own:

- production tags;
- production release authority;
- customer workspaces;
- live credentials;
- billing secrets;
- generated private media after tests complete.

### `drax-recursive`

Owns:

- DRAX's own `FOUNDER_PROFILE.md`;
- `PRODUCT_CONTEXT.md`;
- language, stack, distribution, trigger, measurement, and execution artifacts;
- recursive validation evidence;
- customer-style upgrade testing after a release exists.

Does not own:

- product source edits;
- vendored worker source changes;
- release tags;
- production package metadata.

### `conclave`

Owns:

- internal role research;
- HR role creation;
- full private agent library;
- role updates before vendoring.

Does not own:

- customer runtime state;
- released plugin install behavior;
- customer machine dependencies.

## Secret And Artifact Discipline

Every product repo and factory repo must ignore:

- `.env` and `.env.*`, except committed examples;
- credential material;
- session state;
- browser storage state;
- package tarballs;
- logs;
- generated outputs;
- render outputs;
- runtime `run/` directories.

Stripe and Pagar.me keys live outside repos under `/home/conclave`. They are never copied into source, packages, prompts, logs, generated docs, or artifacts.

## Current Local State

| Local path | Expected state |
|---|---|
| `/home/conclave/drax/drax-plugin` | Released product source, pushed to `origin/main`. |
| `/home/conclave/drax/drax-dev` | Local no-tags factory clone of `drax-plugin`, with push disabled. |
| `/home/conclave/drax/drax-recursive` | Recursive customer workspace with the 12 baseline artifacts. |
| `/home/conclave/conclave-cc` | Internal source library, read-only for customer-runtime work. |

## Next Test Flow

1. Finish the next plugin implementation in `drax-dev`.
2. Run package validation, build, and workspace baseline checks.
3. Create disposable `drax-clean`.
4. Install the plugin as a non-root user in `drax-clean`.
5. Confirm Codex setup requirements: PATH and Device Code login.
6. Confirm the plugin does not require `/home/conclave/conclave-cc`.
7. Run founder intake to baseline artifacts.
8. Attach the generated blog surface to a test existing site identity.
9. Promote only the reviewed passing patch into `drax-plugin`.
10. Release from `drax-plugin`.
11. Update `drax-recursive` through the same customer upgrade path and verify its 12 artifacts remain intact.
