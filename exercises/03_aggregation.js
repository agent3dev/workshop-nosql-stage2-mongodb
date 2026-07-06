// =============================================================
//  FORBES CMS -- Exercise 3: Aggregation
//  Case study: Forbes' MongoDB case study specifically calls out
//  "critical insight into the social sharing of their articles, to
//  capitalize on stories going viral in real-time." That insight
//  comes from aggregation pipelines, not plain find().
// =============================================================

use forbes_cms;

// -------------------------------------------------------
// PART A: Why find() isn't enough anymore
// -------------------------------------------------------

// A1. find() can filter and sort, but it can't compute "average shares
//     per tag" or "total views this week" -- that needs grouping and
//     computed fields across many documents at once.
db.articles.find({}, { title: 1, tags: 1, stats: 1, _id: 0 });

// A helper to make the data more interesting for aggregation --
// bump some view/share counts so the numbers aren't all similar:
db.articles.updateOne({ slug: 'startup-robotics-demo-day' }, { $set: { 'stats.shares': 4200 } });
db.articles.updateOne({ slug: 'chip-shortage-eases-2026' }, { $set: { 'stats.shares': 890 } });


// -------------------------------------------------------
// PART B: The pipeline -- Forbes' "what's going viral" query
// -------------------------------------------------------

// B1. Top 3 articles by shares right now.
db.articles.aggregate([
  { $sort: { 'stats.shares': -1 } },
  { $limit: 3 },
  { $project: { _id: 0, title: 1, type: 1, shares: '$stats.shares' } },
]);

// B2. Average shares PER TAG -- an article can have multiple tags, so we
//     $unwind the tags array first (one output document per tag).
db.articles.aggregate([
  { $unwind: '$tags' },
  { $group: {
      _id: '$tags',
      avg_shares: { $avg: '$stats.shares' },
      article_count: { $sum: 1 },
  }},
  { $sort: { avg_shares: -1 } },
]);

// B3. Engagement by content type -- is video outperforming articles?
db.articles.aggregate([
  { $group: {
      _id: '$type',
      total_views: { $sum: '$stats.views' },
      total_shares: { $sum: '$stats.shares' },
      count: { $sum: 1 },
  }},
  { $addFields: { shares_per_view: { $divide: ['$total_shares', '$total_views'] } } },
  { $sort: { shares_per_view: -1 } },
]);

// B4. Bring in the author's name via $lookup, then group by author.
db.articles.aggregate([
  { $lookup: { from: 'authors', localField: 'author_id', foreignField: '_id', as: 'author' } },
  { $unwind: '$author' },
  { $group: {
      _id: '$author.name',
      articles_written: { $sum: 1 },
      total_views: { $sum: '$stats.views' },
  }},
  { $sort: { total_views: -1 } },
]);


// -------------------------------------------------------
// PART C: Comment-level analysis
// -------------------------------------------------------

// C1. Which articles have the most comments? (comments is embedded array)
db.articles.aggregate([
  { $project: { title: 1, comment_count: { $size: '$comments' } } },
  { $sort: { comment_count: -1 } },
]);

// C2. Flatten every comment across every article into one list, newest first.
db.articles.aggregate([
  { $unwind: '$comments' },
  { $project: { title: 1, user: '$comments.user', text: '$comments.text', at: '$comments.at' } },
  { $sort: { at: -1 } },
]);


// -------------------------------------------------------
// PART D: Open challenges
// -------------------------------------------------------

// D1. Write a pipeline that returns, per author, their single
//     highest-performing article by views.
//     (Hint: $sort inside $group needs $first, or use $sort before $group.)

// D2. Write a pipeline for "trending this week": filter to articles
//     published in the last 7 days, then sort by shares descending.

// D3. Using $bucket or $group on a computed field, bucket articles into
//     'low' / 'medium' / 'high' engagement based on stats.views.
