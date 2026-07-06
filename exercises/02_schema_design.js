// =============================================================
//  FORBES CMS -- Exercise 2: Schema Design (the actual case study)
//  This is the reason Forbes picked MongoDB in the first place.
//  Their CMS has to handle articles, videos, slideshows, and
//  sponsored posts -- each with completely different fields.
//  In Postgres (Stage 1) that means either:
//    a) one giant `content` table with 15 mostly-NULL columns, or
//    b) a table per content type plus a ton of JOINs to render a page.
//  Neither is what Forbes wanted when they needed to ship a new
//  content type in days, not a migration cycle.
// =============================================================

use forbes_cms;

// -------------------------------------------------------
// PART A: See the variable shape for yourself
// -------------------------------------------------------

// A1. Same collection, four different shapes -- no schema migration
//     was needed to add 'video', 'slideshow', or 'sponsored'.
db.articles.find({}, { slug: 1, type: 1, _id: 0 });

db.articles.findOne({ type: 'video' });      // has video_url, duration_seconds
db.articles.findOne({ type: 'slideshow' });  // has slides: [...]
db.articles.findOne({ type: 'sponsored' });  // has sponsor: {...}

// Question for the class: sketch what a Postgres `articles` table would
// need to look like to support all four types with plain columns.
// How many of those columns would be NULL for any given row?


// -------------------------------------------------------
// PART B: Embed vs. Reference -- the decision Forbes' engineers
// had to make for every relationship in the CMS.
// -------------------------------------------------------

// B1. Comments are EMBEDDED directly inside the article.
//     Why embed? Comments are always read together with their article,
//     rarely queried on their own across articles, and bounded in
//     practice (a UI usually paginates after the first ~50).
db.articles.findOne(
  { slug: 'chip-shortage-eases-2026' },
  { comments: 1 }
);

// B2. Authors are REFERENCED, not embedded.
//     Why reference? One author writes MANY articles. If we embedded
//     the full author document into every article, updating an
//     author's bio would mean rewriting every article they ever wrote.
db.articles.findOne({ slug: 'chip-shortage-eases-2026' }).author_id;

// The classic "join" in Mongo -- either two queries...
let art = db.articles.findOne({ slug: 'chip-shortage-eases-2026' });
db.authors.findOne({ _id: art.author_id });

// ...or a single aggregation using $lookup (a left-outer-join-like stage):
db.articles.aggregate([
  { $match: { slug: 'chip-shortage-eases-2026' } },
  { $lookup: {
      from: 'authors',
      localField: 'author_id',
      foreignField: '_id',
      as: 'author',
  }},
  { $unwind: '$author' },
  { $project: { title: 1, 'author.name': 1, _id: 0 } },
]);


// -------------------------------------------------------
// PART C: What happens when embedding goes too far
// -------------------------------------------------------

// C1. Imagine embedding ALL of an author's articles inside the author
//     document instead. Grace Whitfield has written thousands of pieces
//     over 10 years at Forbes -- that single document would keep growing
//     forever and blow past MongoDB's 16MB document size limit.
//     This is exactly why "one author has many articles" = reference,
//     while "one article has a bounded set of comments" = embed.

// C2. Schema validation -- Mongo is schema-FLEXIBLE, not schema-LESS.
//     You can still enforce a minimum shape with $jsonSchema:
db.runCommand({
  collMod: 'articles',
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['slug', 'type', 'title', 'author_id'],
      properties: {
        type: { enum: ['article', 'video', 'slideshow', 'sponsored'] },
      },
    },
  },
  validationLevel: 'moderate',
});

// Try inserting something that violates it:
// db.articles.insertOne({ slug: 'bad-doc' });  // missing required fields -> rejected


// -------------------------------------------------------
// PART D: Open challenges
// -------------------------------------------------------

// D1. Design and insert a 5th content type: 'podcast', with whatever
//     fields make sense (e.g. audio_url, duration_seconds, transcript).
//     No migration required for the DATA -- but Part C installed a
//     strict $jsonSchema validator whose `type` enum only lists the
//     4 known types, so this insert will fail validation until you
//     collMod the validator to add 'podcast' to that enum first.
//     (This is the nuance: flexible storage, but validation rules are
//     still something YOU own and must update deliberately.)

// D2. Decide: should 'tags' stay an embedded array on the article (as it
//     is now), or become its own referenced collection with a tags-to-
//     articles join table? Justify your answer using the same
//     embed-vs-reference reasoning from Part B.

// D3. Add the $jsonSchema validator's 'tags' field as required and of
//     bsonType 'array'. Confirm an insert without tags now fails.
