# Screenshots

Five pages, captured twice: once from the original and once from the rewrite. A rewrite
that set out to reproduce a design should be checkable against what it replaced.

- **`legacy/`** — the Laravel 7 + Vue 2 app, from the running site at
  <https://phive.ivqonsanada.com>. Its code is on the
  [`legacy`](https://github.com/ivqonsanada/phive/tree/legacy) branch.
- **`rewrite/`** — the same pages in the Laravel 13 + Next.js 16 app.

## How to reproduce

Both sets are captured identically, which is what makes a pair worth putting side by
side: **1425px viewport, whole page, signed out**, after the entrance animations have
settled. The two folders hold the same five filenames.

Only signed-out pages are here. Everything behind a login — inbox, party, project box,
settings, shortlist, review — has no legacy counterpart to capture without an account on
the old site, so pairing those is not possible.

When re-capturing the rewrite side from `pnpm dev`, hide the Next.js dev-tools badge
first or it lands in the corner of the image:

```js
document.head.insertAdjacentHTML(
  "beforeend",
  "<style>nextjs-portal { display: none !important }</style>",
);
```

Two differences in the images are the pages themselves, not the capture:

- The legacy leaderboard comes out wider than the viewport (1798px) because its board
  strip overflows horizontally. The rewrite's does not.
- Page heights differ where the rewrite's content differs — the seeded demo data is not
  the same data the old site is serving.
