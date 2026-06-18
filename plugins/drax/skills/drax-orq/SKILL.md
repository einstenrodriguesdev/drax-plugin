---
name: drax-orq
description: Introspect the real Drax orchestration engine: live 4-stage pipeline, run state, and the honest authority model. Use when the user invokes $drax-orq or asks for orchestration, flow, authority, or live run detail.
---

# Drax ORQ

Run `node "<PLUGIN_ROOT>/skills/drax/commands/drax-orq.mjs" "<CWD>" <PAGE-if-present>`, where
`<PLUGIN_ROOT>` is the root of the plugin that contains this skill, `<CWD>` is
the current working directory, and `<PAGE-if-present>` is the optional trailing
page number from the user invocation.

Print the script's stdout verbatim, then stop. If it exits non-zero, print its
error output verbatim and stop.
