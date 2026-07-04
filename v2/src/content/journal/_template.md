---
title: "Template — Journal entry (draft, do not delete)"
category: articles
date: 2026-01-01
summary: "This entry is marked draft and never appears on the site. Duplicate it as the starting point for new journal entries."
draft: true
---

This file exists so the `journal` collection always has at least one
entry — Astro warns when a referenced collection is empty. It is
filtered out of `listJournal()` by the `!data.draft` predicate.

**To add a real journal entry** (or just use the CMS at app.pagescms.org):

1. Duplicate this file, rename to `<your-slug>.md`.
2. Change `draft: true` → `draft: false`.
3. Fill in `title`, `category`, `date`, `summary`.
4. Write the body in markdown below the frontmatter.

Valid categories: `news`, `articles`, `interests`, `event-reports`,
`research`, `projects`.
