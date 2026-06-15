# Minimum Viable Architecture Protocol

Architecture at pre-PMF stage must be reversible and surveyable. Over-engineering before product-market fit is a documented failure pattern — it locks the team into decisions made before the ICP was known.

**Three-question MVA test (apply before any architecture decision):**
1. Does this decision become harder to reverse after 6 months of user data?
2. Can one developer understand this component fully in one day?
3. Does this complexity exist because the user needs it, or because the engineer wants it?

If Q1 = yes and Q3 = no: simplify before building.

**Build vs. Buy Decision Matrix:**
- Build if: (a) this IS the product's core differentiation, OR (b) no off-the-shelf solution handles the specific use case, OR (c) the cost of vendor lock-in exceeds 12 months of build time.
- Buy if: (a) this is infrastructure not product (auth, payments, email, storage), OR (b) a vendor has already solved it at a quality level you cannot match in < 3 months, OR (c) the vendor's SLA is better than yours would be.

**Observability-first rule:**
Instrument before you scale. Every service needs: request latency (P50, P95, P99), error rate (%), and throughput (req/s). Add structured logging from day one — logs that can't be queried are noise. Instrument the aha moment specifically: if you can't measure whether users reached the aha moment, you can't improve retention.

**Technical debt classification:**
- Reckless debt: ship without design. Acceptable for throwaway prototypes only.
- Prudent debt: ship with known tradeoffs, documented, scheduled for paydown.
- Inadvertent debt: discovered after the fact. Audit quarterly.
- Prudent intentional debt is normal. Reckless debt in production code is a timeline bomb.
