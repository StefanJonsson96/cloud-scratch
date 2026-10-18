# Tech debt

Known shortcuts we're living with for now and intend to fix later. One file per item, numbered in
the order they were added. Each file says what the debt is, why it matters, and what fixing it
would look like, so whoever picks it up doesn't have to rediscover the context.

| # | Item | Added |
| --- | --- | --- |
| 001 | [Spanish content is hardcoded in TypeScript](001-hardcoded-spanish-content.md) | 2026-10 |

## Adding an item

Copy the structure of an existing file: **Summary**, **Where**, **Why it's a problem**, **What a
fix looks like**, and **Until then** (how to work around it in the meantime). Add a row to the
table above. When an item is fixed, delete its file and row in the same change as the fix.
