---
name: drax-help
description: Show the deterministic Drax command reference. Use when the user invokes $drax-help or asks for Drax commands.
---

# Drax Help

Run `node "<PLUGIN_ROOT>/skills/drax/commands/drax-help.mjs"`, where
`<PLUGIN_ROOT>` is the root of the plugin that contains this skill.

Print the script's stdout verbatim, then stop. If it exits non-zero, print its
error output verbatim and stop.
