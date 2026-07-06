use forbes_cms;

// F1. Name lookups in the admin UI are prefix/substring searches, not
// exact matches, so a text index (or at minimum a regular index if
// searches are always prefix-anchored, e.g. /^Grace/) fits better than
// a unique index. Since names can repeat and aren't used for routing,
// a text index is the more flexible choice:
db.authors.createIndex({ name: 'text' });
db.authors.find({ $text: { $search: 'Grace' } });

// F2. Tag lookups sorted by recency -- same "equality then sort" shape
// as Part C's (type, published_at) index.
db.articles.createIndex({ tags: 1, published_at: -1 });
db.articles.find({ tags: 'tech' }).sort({ published_at: -1 }).explain('executionStats');

// F3. The riskiest to run online is the unique index on `slug` (B1).
// Building any index requires scanning every existing document, but a
// UNIQUE index additionally means the build fails outright (and rolls
// back) if it discovers even one duplicate slug already in the data --
// on 50M production documents that's a long scan just to potentially
// abort. The type+published_at and text indexes are read-pattern
// optimizations with no correctness risk if the data doesn't
// cooperate; the unique index can fail construction entirely.
