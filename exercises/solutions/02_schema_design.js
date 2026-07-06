use forbes_cms;

// D1. New 'podcast' content type -- no DATA migration needed, but Part C's
// validator enum must be updated first or this insert fails validation.
db.runCommand({
  collMod: 'articles',
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['slug', 'type', 'title', 'author_id'],
      properties: {
        type: { enum: ['article', 'video', 'slideshow', 'sponsored', 'podcast'] },
      },
    },
  },
  validationLevel: 'moderate',
});

db.articles.insertOne({
  slug: 'podcast-ai-in-manufacturing',
  type: 'podcast',
  title: 'AI in Manufacturing -- The Forbes Podcast Ep. 42',
  author_id: 'a2',
  tags: ['tech', 'manufacturing', 'podcast'],
  published_at: new Date(),
  audio_url: 'https://audio.forbes-clone.test/ep42.mp3',
  duration_seconds: 2100,
  transcript: 'Welcome back to the show...',
  comments: [],
  stats: { views: 0, shares: 0 },
});

// D2. Tags stay embedded. They are small, bounded (a handful per
// article), always read together with the article (rendering a page
// needs its tags immediately), and rarely queried independently of an
// article context outside of "find articles with tag X" -- which
// $unwind/array-match handles fine without a join. A separate
// tags-to-articles collection would only pay off if tags had their own
// rich metadata (descriptions, hierarchies) queried heavily on their own.

// D3.
db.runCommand({
  collMod: 'articles',
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['slug', 'type', 'title', 'author_id', 'tags'],
      properties: {
        type: { enum: ['article', 'video', 'slideshow', 'sponsored', 'podcast'] },
        tags: { bsonType: 'array' },
      },
    },
  },
  validationLevel: 'moderate',
});
// db.articles.insertOne({ slug: 'no-tags', type: 'article', title: 'x', author_id: 'a1' });
// -> Document failed validation
