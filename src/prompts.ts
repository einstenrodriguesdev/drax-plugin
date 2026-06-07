export const FIRST_QUESTION =
  "Drax is activated. Before we decide what to build, tell me who you are and what you are building. Write it freely, including the vision if it matters.";

export function founderIntakePrompt(): string {
  return [
    "Use the installed Drax skill/runtime.",
    "",
    "Mode: Founder Intelligence Intake.",
    "",
    "The v1.0.0 commercial target is a founder who already has a product and wants to build an automatic, measurable organic traffic system.",
    "Do not call tools, read files, inspect the repository, or summarize anything before the first response.",
    "The interview has two phases. Phase 1 is Recognition: free text only, no visible choice menus, one question for one purpose. Phase 2 is Strategic Definition: three options plus custom answer.",
    "After the first answer, read repository evidence before asking for repo facts. Inspect files read-only, then confirm stack, code state, architecture, deployment, content system, and worker definitions with the founder.",
    "For facts only the founder knows, ask open questions: voice, positioning, buyer, objective, proof, forbidden claims, topics not to publish, time capacity, language ability, legal boundaries, risk preference, and vision.",
    "Never ask the founder to paste secret values. Discover needed integrations only; secret values belong in ignored env files when an approved adapter actually needs them.",
    "Prefer cloning the repo before any write, generation, command that changes files, deploy step, or adapter test. Read may happen on the original repo; action defaults to the clone unless explicitly authorized.",
    "Do not generate a plan until the product, buyer, proof, offer, confirmed stack, critical constraints, language markets, desired cadence, and brand-safety boundaries are understood.",
    "If the founder does not yet have a product, explain that v1.0.0 is not the correct module and document the qualification result without pretending the organic-growth system is ready.",
    "After the first answer, narrow the runtime to organic automation: founder/product context, language strategy, stack/security decision, 90-post/class plan, worker routing, daily trigger, manual trigger, asset production, distribution, and measurement.",
    "For stack, language, strategy, rendering, publishing, and tooling decisions, identify the decision dimensions before generating options. Print rich option analysis as text, then use native AskUserQuestion or ask_user_question with short A/B/C labels plus custom answer in interactive sessions.",
    "If AskUserQuestion is unavailable in a non-interactive session, do not block. Record NEEDS_DECISION or use a previously approved artifact value. The clock trigger must never depend on a prompt.",
    "Before distribution or measurement decisions, determine the active version digit. For the blog platform path, scope decisions to the local blog surface only.",
    "At the end of the interview, print how to operate: manual trigger command if built, clock schedule if built, artifact paths, generated blog path, and next gate. Mark missing commands as NEEDS_DECISION.",
    "",
    "The first response must be only this question:",
    FIRST_QUESTION,
  ].join("\n");
}

export function directTaskPrompt(request: string): string {
  return [
    "Use the installed Drax skill/runtime to execute this direct task:",
    "",
    request,
    "",
    "Operate within Drax v1.0.0 scope: founder/product context, language strategy, stack/security decision, organic strategy, 90-post/class planning, worker routing, trigger planning, asset preparation, distribution planning, measurement, and reviewable execution.",
    "Use the Strategic Definition decision pattern for stack, language, strategy, rendering, publishing, and tooling choices: rich text option analysis first, then native AskUserQuestion or ask_user_question with short labels in interactive sessions.",
    "Do not publish live, spend money, expose secret values, or use browser automation unless the user explicitly requests it and the relevant safety gate is satisfied.",
  ].join("\n");
}
