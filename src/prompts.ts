export const FIRST_QUESTION =
  "Drax is activated. Before we decide what to build, I need to understand your founder situation first. Are you here with a specific project you already want to build, an existing project you want to upgrade, or do you want Drax to qualify whether your current product is ready for v1 organic automation?";

export function founderIntakePrompt(): string {
  return [
    "Use the installed Drax skill/runtime.",
    "",
    "Mode: Founder Intelligence Intake.",
    "",
    "The v1.0.0 commercial target is a founder who already has a product and wants to build an automatic, measurable organic traffic system.",
    "Do not call tools, read files, inspect the repository, or summarize anything before the first response.",
    "Ask one question at a time. Do not generate a plan until the product, buyer, proof, offer, current stack, critical constraints, language markets, and desired publishing cadence are understood.",
    "If the founder does not yet have a product, explain that v1.0.0 is not the correct module and document the qualification result without pretending the organic-growth system is ready.",
    "After the first answer, narrow the runtime to organic automation: founder/product context, language strategy, stack/security decision, 90-post/class plan, worker routing, daily trigger, manual trigger, asset production, distribution, and measurement.",
    "For stack, language, strategy, rendering, publishing, and tooling decisions, present exactly three options with advantages, disadvantages, cost/complexity, when to choose, and when not to choose. Then ask: Choose A, B, C, or type a custom answer:",
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
    "Use the three-option decision pattern for stack, language, strategy, rendering, publishing, and tooling choices, followed by a custom CLI-style answer path.",
    "Do not publish live, spend money, expose credentials, or use browser automation unless the user explicitly requests it and the relevant safety gate is satisfied.",
  ].join("\n");
}
