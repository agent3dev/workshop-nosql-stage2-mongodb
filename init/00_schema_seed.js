// =============================================================
//  FORBES CMS (mini-clone) -- Schema + Seed Data
//  Workshop NoSQL Stage 2 -- MongoDB
// =============================================================
// This models a simplified version of what Forbes actually rebuilt
// their CMS on in 2011: one place to store very differently-shaped
// content (articles, videos, slideshows, sponsored posts) without
// forcing them into a rigid relational schema.

db = db.getSiblingDB('forbes_cms');

db.createCollection('authors');
db.createCollection('articles');

db.authors.insertMany([
  { _id: 'a1', name: 'Grace Whitfield',  bio: 'Markets & finance contributor', joined_year: 2015 },
  { _id: 'a2', name: 'Marcus Ibe',       bio: 'Consumer tech reporter',        joined_year: 2019 },
  { _id: 'a3', name: 'Priya Nandakumar', bio: 'Editor, Innovation desk',       joined_year: 2012 },
]);

db.articles.insertMany([
  {
    slug: 'chip-shortage-eases-2026',
    type: 'article',
    title: 'The Chip Shortage Is Finally Easing -- Here Is What Changed',
    author_id: 'a1',
    tags: ['markets', 'tech', 'supply-chain'],
    published_at: new Date('2026-01-12'),
    body: 'After three years of constrained supply, semiconductor lead times...',
    comments: [
      { user: 'reader88', text: 'Great breakdown, thanks.', at: new Date('2026-01-12T09:15:00Z') },
      { user: 'mkt_watcher', text: 'Curious how this affects auto makers.', at: new Date('2026-01-12T10:02:00Z') },
    ],
    stats: { views: 18400, shares: 320 },
  },
  {
    slug: 'startup-robotics-demo-day',
    type: 'video',
    title: 'Watch: 12 Robotics Startups Pitch in 90 Seconds Each',
    author_id: 'a2',
    tags: ['tech', 'startups', 'robotics'],
    published_at: new Date('2026-02-03'),
    video_url: 'https://video.forbes-clone.test/demo-day-2026.mp4',
    duration_seconds: 540,
    comments: [
      { user: 'roboenjoyer', text: 'The warehouse-picking one was slick.', at: new Date('2026-02-03T14:00:00Z') },
    ],
    stats: { views: 52100, shares: 1890 },
  },
  {
    slug: 'worlds-tallest-modular-buildings',
    type: 'slideshow',
    title: "Inside the World's Tallest Modular Buildings",
    author_id: 'a3',
    tags: ['real-estate', 'engineering'],
    published_at: new Date('2026-01-28'),
    slides: [
      { image_url: 'https://img.forbes-clone.test/modular-1.jpg', caption: 'Module stacking in Brooklyn, 2024' },
      { image_url: 'https://img.forbes-clone.test/modular-2.jpg', caption: 'Factory floor in Ohio' },
      { image_url: 'https://img.forbes-clone.test/modular-3.jpg', caption: 'Completed 32-story tower' },
    ],
    comments: [],
    stats: { views: 9800, shares: 145 },
  },
  {
    slug: 'sponsored-cloud-migration-playbook',
    type: 'sponsored',
    title: 'How Mid-Size Retailers Are Cutting Cloud Costs 40%',
    author_id: 'a2',
    tags: ['cloud', 'retail'],
    published_at: new Date('2026-02-10'),
    sponsor: { name: 'Northwind Cloud', campaign_id: 'nc-q1-2026' },
    body: 'In partnership with Northwind Cloud, we spoke to five retail CTOs...',
    comments: [],
    stats: { views: 4200, shares: 60 },
  },
]);
