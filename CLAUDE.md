@AGENTS.md

<!-- BEGIN @przeprogramowani/10x-cli -->

## 10xDevs AI Toolkit - Module 4, Lesson 3 (Feature Analysis)

Turn the Project Map into a grounded analysis of one feature: what works, what's weak, what to modernise.

```
context/map/repo-map.md -> /10x-research (trace + test gaps + blast radius) -> ast-grep verification -> research.md
```

### Task Router - Where to start

| Skill / prompt | Use it when |
| --- | --- |
| `m4l3-1-research-with-map` | Running `/10x-research` on one feature with `repo-map.md` as input. Three parallel sub-agents trace the flow end to end, find test-coverage gaps and measure the blast radius. The report ends with Feature overview and Technical debt sections. Adapt the feature name in the prompt to your repo. |
| `m4l3-2-ast-grep-verification` | Confirming or refuting every structural claim in that report (call-site counts, "only here", "always through X") with ast-grep, then correcting the report. |
| `/10x-repo-map` | There is no `context/map/repo-map.md` yet, or it is stale. |

### Hard rules

- **This is investigation, not a refactor.** Don't change production code in this lesson.
- **Check every structural claim with a tool.** ast-grep matches syntax precisely; grep matches literal text. Double-check every zero from ast-grep with grep, so a wrong pattern isn't mistaken for "no occurrences".
- **Cite `file:line`** for every step of the trace and every debt item.

<!-- END @przeprogramowani/10x-cli -->
