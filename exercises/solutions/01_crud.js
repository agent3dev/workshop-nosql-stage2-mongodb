use forbes_cms;

// D1.
db.authors.insertOne({ _id: 'a5', name: 'Sample Author', bio: 'Test bio', joined_year: 2026 });
db.articles.insertOne({
  slug: 'sample-article-one', type: 'article', author_id: 'a5',
  title: 'Sample One', tags: ['sample'], published_at: new Date(),
  body: '...', comments: [], stats: { views: 0, shares: 0 },
});
db.articles.insertOne({
  slug: 'sample-video-one', type: 'video', author_id: 'a5',
  title: 'Sample Video', tags: ['sample'], published_at: new Date(),
  video_url: 'https://example.test/v.mp4', comments: [], stats: { views: 0, shares: 0 },
});

// D2.
db.articles.find({
  published_at: { $gte: new Date('2026-01-01'), $lt: new Date('2027-01-01') },
  'stats.shares': { $gt: 100 },
}).sort({ 'stats.shares': -1 });

// D3.
db.articles.updateOne(
  { slug: 'chip-shortage-eases-2026' },
  { $push: { comments: { user: 'temp_user', text: 'temp comment', at: new Date() } } }
);
db.articles.updateOne(
  { slug: 'chip-shortage-eases-2026' },
  { $pop: { comments: -1 } } // -1 removes the FIRST element, 1 removes the last
);
