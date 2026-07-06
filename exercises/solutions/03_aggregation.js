use forbes_cms;

// D1. Each author's single highest-performing article by views.
db.articles.aggregate([
  { $sort: { 'stats.views': -1 } },
  { $group: {
      _id: '$author_id',
      top_article: { $first: '$title' },
      top_views: { $first: '$stats.views' },
  }},
]);

// D2. Trending this week.
db.articles.aggregate([
  { $match: { published_at: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
  { $sort: { 'stats.shares': -1 } },
]);

// D3. Bucket by engagement.
db.articles.aggregate([
  { $bucket: {
      groupBy: '$stats.views',
      boundaries: [0, 10000, 30000, Infinity],
      default: 'other',
      output: { count: { $sum: 1 }, titles: { $push: '$title' } },
  }},
]);
// boundaries [0,10000) = low, [10000,30000) = medium, [30000, inf) = high
