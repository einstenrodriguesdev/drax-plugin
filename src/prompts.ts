export const FIRST_QUESTION =
  "Drax is activated. Before we decide what to build, I need to understand your founder situation first. Are you here with a specific project you already want to build, an existing project you want to upgrade, or do you want Drax to discover the best enterprise opportunity for you based on your goals, skills, capital, and market research?";

export function founderIntakePrompt(): string {
  return [
    "Use the installed Drax skill/runtime.",
    "",
    "Mode: Founder Intelligence Intake.",
    "",
    "The v1.0.0 commercial target is a founder who already has a product and wants to build an automatic, measurable organic traffic system.",
    "Do not call tools, read files, inspect the repository, or summarize anything before the first response.",
    "Ask one question at a time. Do not generate a plan until the product, buyer, proof, offer, constraints, and desired publishing cadence are understood.",
    "If the founder does not yet have a product, explain that v1.0.0 is not the correct module and document the qualification result without pretending the organic-growth system is ready.",
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
    "Operate within Drax v1.0.0 scope: founder/product context, organic strategy, editorial planning, asset preparation, distribution planning, measurement, and reviewable execution.",
    "Do not publish live, spend money, expose credentials, or use browser automation unless the user explicitly requests it and the relevant safety gate is satisfied.",
  ].join("\n");
}
