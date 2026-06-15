# CRO Experimentation Framework
> Status: stub | Created: 2026-04-27 | Applies to: CRO Specialist, Analytics Attribution Specialist
> Content to be researched: statistical power analysis protocol, SRM detection, peeking mitigation, sequential testing, test conclusion decision tree

## Contents (to be populated on first use)

- **MDE selection guide**: How to choose the Minimum Detectable Effect — typical ranges (10% relative for high-traffic pages, 20%+ for low-traffic pages), business-driven MDE vs. statistical MDE, and why MDE below 5% relative is rarely actionable at startup traffic volumes
- **Sample size calculation**: Formula inputs (baseline CVR, MDE, α=0.05, power=0.80 defaults), tools (Evan Miller's A/B test sample size calculator, Convert.com calculator), common mistakes (using aggregate site traffic instead of segment-specific traffic on the tested page)
- **Sample Ratio Mismatch (SRM) detection**: Chi-square test on observed split vs. expected split (p<0.01 threshold for declaring SRM), common causes (bot traffic, cookie deletion, timing delays, triggering errors), remediation steps before re-launching
- **Peeking mitigation**: Sequential testing (mSPRT — always-valid inference) available in Optimizely Stats Engine, Convert.com, and VWO; fixed-horizon test configuration where sequential testing is not available; no-peek rule enforcement via test platform configuration
- **Novelty Effect mitigation protocol**: Signs of novelty effect (lift decays monotonically over test duration), segment-level analysis (new vs. returning users), minimum duration extension for tests with returning-user audiences (4 weeks minimum for surfaces with >60% returning users)
- **Test conclusion decision tree**:
  - SRM detected → void, debug, relaunch
  - SRM clean + significant + macro positive → ship
  - SRM clean + significant + macro neutral/negative → local maximum, do not ship, document
  - SRM clean + not significant → null result, document learnings, remove hypothesis from backlog
  - SRM clean + test duration exceeded without significance → null, same as above
- **Frequentist vs. Bayesian result interpretation**: When to use Bayesian probability of improvement (useful for directional decisions when sample size is borderline), relationship to frequentist p-value, avoiding "probability of being best" misinterpretation

## Source candidates (to populate on research)
- Kohavi, R., Tang, D., Xu, Y. (2020). *Trustworthy Online Controlled Experiments*. Cambridge University Press.
- Johari et al. (2017). "Peeking at A/B Tests: Why it matters and what to do about it." Stanford.
- VWO: https://vwo.com/glossary/sample-ratio-mismatch/
- Convert.com: A/B test statistical documentation
- Evan Miller: https://www.evanmiller.org/ab-testing/sample-size.html
