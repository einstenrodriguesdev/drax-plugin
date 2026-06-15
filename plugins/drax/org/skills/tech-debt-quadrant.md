# Technical Debt Quadrant (Martin Fowler)

Not all technical debt is equal. Classify before deciding whether to pay it down.

**Four quadrants:**

**Reckless + Deliberate:** "We don't have time to design this."
Ship fast, no design, full awareness of the mess created. Acceptable for throwaway prototypes, competitive time pressure, or features being validated before permanent build. Danger: this quadrant grows if the team normalizes it. Every quarter, audit how much of the codebase lives here.

**Reckless + Inadvertent:** "What's layering?"
Team didn't know better when they built it. Discovered through code review, bugs, or onboarding friction. Address through: tech debt sprints, refactoring as part of feature work, architectural review sessions.

**Prudent + Deliberate:** "We must ship now — we'll fix this later."
Conscious tradeoff with a documented plan. This is healthy debt. Required: (a) write down what the tradeoff is, (b) set a date to revisit, (c) create a ticket. Undocumented prudent debt becomes inadvertent debt within 6 months.

**Prudent + Inadvertent:** "Now we know how we should have done it."
Best outcome: team learned something by building. The new knowledge shows a better path. Schedule refactor to apply the learning before it compounds.

**Debt budget rule:**
Allocate 20% of engineering capacity to debt paydown at all times (pre-PMF). After PMF: increase to 30% as codebase complexity increases with user load. Teams that defer all debt paydown hit a wall at scale where new features take 3× as long.

**When to rewrite vs. refactor:**
Rewrite only if: (a) the debt is in a component that changes constantly, (b) the component has < 50% test coverage, AND (c) the team has > 3 months of data on what it actually needs to do. Otherwise: refactor incrementally.
