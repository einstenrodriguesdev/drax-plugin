---
name: drax-map
description: Show the deterministic Drax system map for the current workspace. Use when the user invokes $drax-map or asks for the Drax sectors, gates, triggers, or artifact status.
---

# Drax Map

Run `node "<PLUGIN_ROOT>/skills/drax/commands/drax-map.mjs" "<CWD>"`, where
`<PLUGIN_ROOT>` is the root of the plugin that contains this skill and `<CWD>`
is the current working directory.

Print the script's stdout verbatim, then stop. If it exits non-zero, print its
error output verbatim and stop.
