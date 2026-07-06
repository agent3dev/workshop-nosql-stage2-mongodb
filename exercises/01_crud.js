// =============================================================
//  FORBES CMS -- Exercise 1: CRUD basics
//  Case study: in 2011 Forbes rewrote their CMS on MongoDB so
//  editors could publish very different kinds of content without
//  a DBA changing table schemas every time. Before we get to WHY
//  the document model helps with that (exercise 2), let's just
//  get comfortable reading and writing documents.
// =============================================================

use forbes_cms;

// -------------------------------------------------------
// PART A: Reading what's already there
// -------------------------------------------------------

// A1. See everything.
db.articles.find();

// A2. Pretty-print one document.
db.articles.findOne({ slug: 'chip-shortage-eases-2026' });

// A3. Only some fields (projection). _id always comes back unless excluded.
db.articles.find(
  { type: 'article' },
  { title: 1, author_id: 1, _id: 0 }
);

// A4. Filter + sort + limit -- the find() equivalent of WHERE / ORDER BY / LIMIT.
db.articles.find({ tags: 'tech' })
  .sort({ published_at: -1 })
  .limit(2);

// A5. Count.
db.articles.countDocuments({ type: 'video' });


// -------------------------------------------------------
// PART B: Writing
// -------------------------------------------------------

// B1. Insert a single new article.
db.articles.insertOne({
  slug: 'quarterly-earnings-recap-q1',
  type: 'article',
  title: 'Q1 Earnings Recap: Who Beat Expectations',
  author_id: 'a1',
  tags: ['markets', 'earnings'],
  published_at: new Date(),
  body: 'A roundup of this quarter\'s notable earnings surprises...',
  comments: [],
  stats: { views: 0, shares: 0 },
});

// B2. Insert many at once.
db.authors.insertMany([
  { _id: 'a4', name: 'Diego Fontaine', bio: 'Freelance, energy sector', joined_year: 2023 },
]);

// B3. Update one field on a matching document.
db.articles.updateOne(
  { slug: 'quarterly-earnings-recap-q1' },
  { $set: { 'stats.views': 120 } }
);

// B4. Push a new comment onto an embedded array -- no separate table needed.
db.articles.updateOne(
  { slug: 'quarterly-earnings-recap-q1' },
  { $push: { comments: { user: 'trader_jo', text: 'Nice summary!', at: new Date() } } }
);

// B5. Increment a counter atomically (no read-then-write race condition).
db.articles.updateOne(
  { slug: 'quarterly-earnings-recap-q1' },
  { $inc: { 'stats.views': 1 } }
);

// B6. Delete.
db.articles.deleteOne({ slug: 'quarterly-earnings-recap-q1' });


// -------------------------------------------------------
// PART C: A first look at "it's not SQL"
// -------------------------------------------------------

// C1. There is no JOIN. author_id is just a string we store ourselves --
//     resolving it to an author's name is on us (more on this in Exercise 2).
db.articles.findOne({ slug: 'startup-robotics-demo-day' }).author_id;
db.authors.findOne({ _id: 'a2' });

// C2. Querying inside an array of embedded documents:
db.articles.find({ 'comments.user': 'roboenjoyer' });

// Question for the class: what would the equivalent look like in Postgres,
// given what you built in Stage 1? (Hint: think about the transfer_log
// table from the stored-procedures exercise.)


// -------------------------------------------------------
// PART D: Open challenges
// -------------------------------------------------------

// D1. Insert a new author of your choice, then insert two new articles
//     written by them (any 'type').

// D2. Write a query that finds every article published in 2026 with
//     more than 100 shares, sorted by shares descending.

// D3. Add a comment to any article, then write an update that removes
//     the FIRST comment from that same article's array.
//     (Hint: look up the $pop operator.)
