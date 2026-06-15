# Sales OSINT Lead Intelligence
> Applies to: OSINT Specialist, BDR, CRO
> Status: stub
> Created: 2026-04-30 by HR agent

---

## Scope

This document covers the operational mechanics of sales-focused OSINT in a Conclave context. It defines: the intelligence cycle for commercial prospecting, source grading and confidence notation, signal taxonomy, contact and org-chart recovery rules, provenance logging, archive policy, and legal / ethical guardrails for public-source research.

---

## Intelligence Cycle for Sales OSINT

**1. Direction**
- State the intelligence question before collecting anything.
- Good example: "Which Series B fintechs in Brazil are entering a compliance-buying window this quarter?"
- Bad example: "Find more leads."
- Required inputs: ICP definition, excluded sectors, target buyer titles, region, and what counts as a useful trigger event.

**2. Collection**
- Use only publicly accessible and operationally permitted sources: company websites, leadership pages, partner directories, job boards, conference speaker pages, regulatory filings, investor pages, GitHub, public docs, archived pages, and public social activity.
- Never treat "publicly visible" as blanket permission for mass harvesting or indefinite storage.
- Capture source URL, access date, and whether an archive copy was made for every material finding.

**3. Processing**
- Remove duplicates, normalize company names, normalize titles, and separate verified facts from inferred hypotheses.
- Do not merge contacts automatically when title, geography, or business unit conflicts remain unresolved.
- Tag every field as verified / inferred / rejected.

**4. Analysis**
- Convert observations into a commercial conclusion.
- Required question: "Why does this matter for this ICP right now?"
- Use signal stacking. One signal is a clue; multiple converging signals create a buying-thesis candidate.

**5. Production**
- Package results into one of the role's canonical outputs: target map, account brief, watchlist, verification log, or method log.
- Every production artifact must include confidence and next owner.

**6. Dissemination**
- The deliverable must be usable by BDR, CRO, founder, or CLO without reconstructing the research path.
- Intelligence without a clear handoff owner is incomplete.

---

## Source Reliability and Confidence Notation

Use a simple adapted Admiralty-style model:

- **A** - highly reliable source class for the claim type (official company site, verified filing, first-party job post, official docs)
- **B** - usually reliable (reputable event site, recognized directory, credible press release mirror)
- **C** - mixed reliability (user-generated public profile, scraped public listing, stale archive with partial context)
- **D** - low reliability or weakly attributable source

Information credibility:

- **1** - confirmed by multiple independent sources
- **2** - probably true, supported by one strong source plus one secondary corroboration
- **3** - plausible but not sufficiently confirmed
- **4** - doubtful or conflicted

Default export rules:

- `A1` / `A2` / `B1` / `B2` may enter CRM-ready outputs
- `B3` / `C2` / `C3` may appear in briefs as hypotheses, not as verified CRM rows
- `C4` / `D*` must not be treated as production-ready

---

## Multi-Source Verification Standard

Minimum standard before labeling a contact or account insight "verified":

- 2 independent sources for company identity and buyer-function fit
- 2 independent sources for a named contact's current title when possible
- 3 or more sources for a high-priority trigger event if it will drive immediate outreach
- 1 archived copy for any source likely to disappear (job post, team page, press item, pricing / docs change)

Upscend's job specification sets a useful operational bar: cross-validate lead data across 5+ OSINT sources before CRM entry when the account is strategically important. In Conclave, apply the 5+ standard to Tier 1 accounts and executive / compliance buyers; lower tiers can use lighter verification if clearly labeled.

---

## Signal Taxonomy

High-value signal classes for outbound research:

**Hiring Signals**
- Job postings for the capability your product addresses
- Leadership hiring (Head of Compliance, VP RevOps, Staff Security Engineer, etc.)
- Sudden multi-role hiring in one pain domain

**Org / Ownership Signals**
- Executive changes
- New regional leadership
- New board advisor with domain relevance
- New partner or reseller owner

**Technographic Signals**
- Public docs referencing a new stack
- Integration pages added / removed
- Job descriptions mentioning competitor or prerequisite platforms
- Shodan / Censys / source-code clues that validate infrastructure posture when commercially relevant

**Market / Regulatory Signals**
- Filings, compliance notices, policy updates, certifications, regulatory pressure
- Press releases indicating new product lines, market entry, or audit events

**Behavioral / Engagement Signals**
- Pricing-page visits or product-interest data from sanctioned GTM systems
- Repeated content engagement
- Open-source or community activity tied to the problem domain

**Decay Rule**
- If a signal is older than 30 days and no second signal reinforces it, downgrade its priority
- If older than 90 days, treat it as context only unless renewed

---

## Contact and Org-Chart Recovery

Recover contact paths in this order:

1. Confirm the company entity and relevant business unit
2. Confirm the buyer function required by ICP
3. Search first-party sources (team pages, leadership pages, speaker pages, docs authorship, partner listings)
4. Corroborate through public professional profiles and event records
5. Only then infer email patterns or reporting lines

Rules:

- Never infer a direct dial from pattern logic alone
- Never export an email address as verified unless pattern confidence and person-fit confidence are both strong
- Archived team pages are valid context, but must be labeled with archive date because titles may have changed

---

## Provenance and Archive Policy

For any material claim:

- Store the original source URL
- Capture the access date
- Archive ephemeral pages when possible
- Note whether the claim is direct evidence or inference

Bellingcat's operational lesson applies directly here: if you cannot show the original source, you are asking downstream users to trust you instead of the evidence. That is unacceptable for high-confidence commercial intelligence.

---

## Legal and Ethical Guardrails

- Public access does not automatically equal lawful commercial reuse
- Respect visibility settings, robots.txt, rate limits, and platform terms where they apply
- Do not bypass logins, CAPTCHAs, or paid walls through deceptive means
- Do not use leaked credentials, password resets, impersonation, or dark-pattern collection
- Do not use HIBP domain search unless the domain is verified and the use is defensible
- If a method is legally or ethically ambiguous, stop and escalate

Commercial cautionary example:
- In January 2025 the EDPB summarized the CNIL fine against KASPR for prospecting-oriented contact scraping from LinkedIn and other sites, with findings on legal basis, retention, transparency, and access rights. Treat that case as the baseline warning that "it was public" is not a sufficient defense.

---

## Output Quality Rules

Every deliverable must answer:

- What is the account / contact / signal?
- Why does it matter now?
- How confident are we?
- Which sources support it?
- Who should act next?

If any of those are missing, the output is not yet intelligence.
