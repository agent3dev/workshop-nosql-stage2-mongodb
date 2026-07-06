// =============================================================
//  FORBES CMS -- Exercise 4: Indexes
//  Case study: with ~121M monthly users, Forbes cannot afford a
//  collection scan every time someone loads an article by slug or
//  searches the site. This is the exercise where "it worked on our
//  4-article seed data" stops being good enough.
// =============================================================

use forbes_cms;

// -------------------------------------------------------
// PART A: See the problem first
// -------------------------------------------------------

// A1. Without an index, looking up by slug is a full collection scan
//     (COLLSCAN). At 4 documents you won't feel it -- at Forbes' real
//     article volume, you would.
db.articles.find({ slug: 'chip-shortage-eases-2026' }).explain('executionStats').executionStats;
// Look for: "stage": "COLLSCAN" and totalDocsExamined vs nReturned.


// -------------------------------------------------------
// PART B: Unique index -- slugs must never collide
// -------------------------------------------------------

// B1. A slug is how a URL routes to an article -- two articles can't
//     share one. Enforce it at the database level, not just in app code.
db.articles.createIndex({ slug: 1 }, { unique: true });

// B2. Now the same lookup uses the index:
db.articles.find({ slug: 'chip-shortage-eases-2026' }).explain('executionStats').executionStats;
// Look for: "stage": "IXSCAN".

// B3. Prove uniqueness is enforced:
// db.articles.insertOne({ slug: 'chip-shortage-eases-2026', type: 'article', title: 'dup' });
// -> E11000 duplicate key error


// -------------------------------------------------------
// PART C: Compound index -- match the real query pattern
// -------------------------------------------------------

// C1. Forbes' homepage query is really "latest articles of a given type",
//     e.g. latest videos, latest sponsored posts. A compound index
//     matching (equality field, sort field) serves this directly.
db.articles.createIndex({ type: 1, published_at: -1 });

db.articles.find({ type: 'article' }).sort({ published_at: -1 }).explain('executionStats').executionStats;

// Question for the class: why does field ORDER in a compound index
// matter? (Hint: try swapping to { published_at: -1, type: 1 } and
// compare explain() output for a query that only filters on type.)


// -------------------------------------------------------
// PART D: Text index -- basic on-site search
// -------------------------------------------------------

// D1. Let readers search by title/body keywords.
db.articles.createIndex({ title: 'text', body: 'text' });

db.articles.find({ $text: { $search: 'chip shortage' } });

// D2. Text search relevance score:
db.articles.find(
  { $text: { $search: 'cloud retail' } },
  { score: { $meta: 'textScore' }, title: 1 }
).sort({ score: { $meta: 'textScore' } });


// -------------------------------------------------------
// PART E: Inspect what you've built
// -------------------------------------------------------

db.articles.getIndexes();


// -------------------------------------------------------
// PART F: Open challenges
// -------------------------------------------------------

// F1. Authors are looked up by _id already (fast, _id is always indexed).
//     But editors also search authors by name in the admin UI --
//     add the right index for `db.authors.find({ name: /.../ })` style
//     lookups and justify your choice.

// F2. Add an index to support "all articles with a given tag, newest
//     first" efficiently. Confirm with explain() that it's used.

// F3. One of B1/C1/D1 above, if applied blindly to a 50-million-document
//     production collection, would be the riskiest to run online.
//     Which one, and why? (Hint: think about what building each index
//     costs in terms of a full collection scan + write lock behavior.)
