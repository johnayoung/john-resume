# JOHN YOUNG

**Head of Engineering | Chief Technology Officer | DeFi Execution Infrastructure | AI-Native Engineering**

Laurel, Maryland  
[john.anto.young@gmail.com](mailto:john.anto.young@gmail.com)  
[LinkedIn](https://linkedin.com/in/jyoung1985) • [Portfolio](https://jyoung.dev) • [GitHub](https://github.com/johnayoung)

---

## PROFESSIONAL SUMMARY

Head of engineering and CTO who ships trading and DeFi infrastructure, from audited on-chain contracts to sub-millisecond execution, with an agent-first workflow: AI agents write most of the code, while deterministic graders, blind test oracles, and human-reviewed PRs decide what ships. Built the open-source control plane that runs it. 15+ years in finance and fintech, two startup exits.

---

## WORK EXPERIENCE

### Head of Engineering
**Infrared** • *November 2025 - Present*

- Built Infrared's production DeFi routing API: a min-cost-flow solver over **28 protocols** on Ethereum, Base, and Arbitrum that routes multi-asset portfolios in a single atomic transaction
- Shipped the Solidity execution layer to **3 mainnets**, backed by **257 Foundry tests** and a Nethermind audit
- Built a Rust UniswapX filler grader-first with AI agents: first live fills **4 days** after the first commit, RFQ quoting in production by day 24; in its first 4 days of quoting it answered **5.4M requests** and filled **$566K** with zero ledger mismatches
- Cut filler decision latency to **~500 µs p50** (2.3 ms p95) and p99 feed latency from **14.1 s to 89 ms**

*AI automation*

- **Routing reliability:** daily Claude job on Cloud Run clusters failed quotes, adversarially re-checks each diagnosis, and files evidence-backed issues and fix PRs: **139 issues** and **15 chain-wide outage alerts** since July
- **Protocol research desk:** weekly agents verify facts for **12 DeFi protocols** against primary sources, escalate contradictions to a human, and surface new integration candidates: **150 merged PRs**
- **Trading forensics:** sandboxed agents post-mortem lost orders by on-chain replay; a blind verifier ranks causes by dollars, and the top three fixes now run in production
- **Decision research:** an agent-audited counterfactual replay of **5,451** RFQ orders drove the decision to enter UniswapX quoting
- **Engineering delivery:** **92 of 94** spec'd tasks landed through a self-built agent control plane, each gated by command graders, rubric review, and blind held-out tests

### Chief Technology Officer
**Combine Capital** • *January 2023 - Present*

- Built and solely maintain Combine's fund administration stack: a Go platform (**~80K LOC**) that turns **13 custodian, exchange, and on-chain sources** into a ledger, daily NAV, and monthly investor reports
- Automated the monthly fund close from **1-2 days to under an hour**, reconciling **6 venues** across multiple fund entities on one multi-tenant platform
- Made on-chain activity book itself: transaction decoders for **18 DeFi protocols and bridges** across 6 EVM chains, Solana, and Bitcoin
- Led two platform generations, from a Python/Airflow/BigQuery pipeline over **24 data vendors** to a Go/Postgres rewrite on Cloud Run with full CI/CD
- Gave the investment team self-serve data: a React admin app (real-time positions, TWRR, exposure) and a Google Workspace Marketplace add-on with **21 live data functions**
- Codified the close and audit investigations as agent-run Claude Code workflows; led technical due diligence for portfolio investments

### Software Engineer
**FRACTAL (Fractal Wealth)** • *January 2021 - January 2022*

- Designed and deployed automated crypto/DeFi trading strategies, validated by a backtesting framework covering **5+ years** of data
- Built risk management with dynamic position sizing, reducing potential losses by **40%**

### Founder & Chief Technology Officer
**Cryptosheets** • *January 2016 - January 2021*

- Built a real-time crypto market data platform and Excel add-in, scaling to **30,000+ active users** within 12 months
- Grew a **5,000+** recurring-revenue subscriber base and led two exits, to a strategic buyer and a private buyer

### Principal Financial Analyst
**Capital One** • *January 2010 - January 2017*

- Led cross-functional teams building financial models for a **$1B+ credit portfolio**, progressing from Finance Rotation to Principal Analyst

---

## SELECTED PROJECTS

**AI agent engineering**

- **[flywheel](https://github.com/johnayoung/flywheel)**: Rust control plane for AI coding agents: worktree isolation, grader-gated landing, blind held-out oracles, a multi-agent hub, and an eval harness; its own worker landed **931 commits** through graders
- **[agent-engineering-toolkit](https://github.com/johnayoung/agent-engineering-toolkit)**: **28** Claude Code skills and templates, one per jyoung.dev essay
- **[jyoung.dev](https://jyoung.dev)**: **30 weekly essays** on AI coding-agent engineering and a field report grounded in **114 primary sources**

**DeFi infrastructure (Go)**

- **[go-mcf](https://github.com/Infrared-Trading-Technologies/go-mcf)**: Go port of LEMON's Network Simplex min-cost-flow solver, specialized for DeFi (uint256 flows)
- **[go-weiroll](https://github.com/Infrared-Trading-Technologies/go-weiroll)**: Weiroll command planner for chaining smart-contract calls in one transaction
- **[go-gas](https://github.com/Infrared-Trading-Technologies/go-gas)**: Low-latency, push-based EIP-1559 gas estimator for trading and MEV workloads

---

## TECHNICAL SKILLS

| Category           | Technologies                                                                                               |
| ------------------ | ---------------------------------------------------------------------------------------------------------- |
| **Languages**      | Go, Rust, Solidity, Python, TypeScript, SQL                                                                |
| **AI / Agents**    | Claude Code (skills, subagents, hooks), Claude Agent SDK, MCP, agent harnesses, grader and held-out-oracle verification, agent evals, LangChain, LangGraph, CrewAI, LoRA/QLoRA |
| **DeFi & Trading** | Uniswap V2-V4, UniswapX, Curve, Balancer, Aave, Morpho, Weiroll, Foundry, revm, RFQ, FIX, CCXT, Hummingbot |
| **Infrastructure** | GCP, AWS, PostgreSQL, Redis, BigQuery, Airflow, Temporal, Docker, GitHub Actions, OpenTelemetry            |
| **Frontend**       | React, Next.js, Tailwind CSS                                                                               |

---

## EDUCATION

**Bachelor of Science, Finance & Economics** • Towson University  
**Engineering Immersion Program** • Thinkful

## CERTIFICATIONS

**StrategyV2 Developer, MVP Award** • Hummingbot Foundation • *May 2024*
