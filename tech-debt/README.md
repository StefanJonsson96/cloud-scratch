# Tech debt

Known shortcuts we're living with for now and intend to fix later. One file per item, numbered in
the order they were added. Each file says what the debt is, why it matters, and what fixing it
would look like, so whoever picks it up doesn't have to rediscover the context.

| # | Item | Added |
| --- | --- | --- |
| 002 | [Generated synonyms and sentences are picked by rules, not reviewed](002-generated-content-is-not-reviewed.md) | 2026-10 |
| 003 | [The recorded voices are inlined in the single-file build](003-voices-are-inlined-in-the-single-file-build.md) | 2026-10 |

## Adding an item

Copy the structure of an existing file: **Summary**, **Where**, **Why it's a problem**, **What a
fix looks like**, and **Until then** (how to work around it in the meantime). Add a row to the
table above. When an item is fixed, delete its file and row in the same change as the fix.
