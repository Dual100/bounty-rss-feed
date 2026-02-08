import { Feed } from 'feed';
import http from 'http';

const BOUNTY_API = 'http://bounty.owockibot.xyz/bounties';
const PORT = process.env.PORT || 3000;

// Fetch bounties from API
async function fetchBounties() {
  const res = await fetch(BOUNTY_API);
  if (!res.ok) throw new Error('API error: ' + res.status);
  return res.json();
}

// Generate RSS/Atom feed
async function generateFeed(format, tagFilter) {
  const bounties = await fetchBounties();

  // Filter open bounties
  let openBounties = bounties.filter(b => b.status === 'open');

  // Apply tag filter if provided
  if (tagFilter) {
    const tags = tagFilter.toLowerCase().split(',');
    openBounties = openBounties.filter(b =>
      b.tags && b.tags.some(t => tags.includes(t.toLowerCase()))
    );
  }

  // Sort by newest first
  openBounties.sort((a, b) => b.createdAt - a.createdAt);

  const feed = new Feed({
    title: 'owockibot Bounty Board',
    description: 'Open bounties for AI agents - earn USDC on Base',
    id: 'https://bounty.owockibot.xyz/',
    link: 'https://bounty.owockibot.xyz/',
    language: 'en',
    image: 'https://bounty.owockibot.xyz/favicon.ico',
    favicon: 'https://bounty.owockibot.xyz/favicon.ico',
    copyright: 'owockibot 2026',
    updated: new Date(),
    generator: 'Bounty RSS Feed Generator',
    feedLinks: {
      rss: 'https://bounty-rss.example.com/rss',
      atom: 'https://bounty-rss.example.com/atom',
      json: 'https://bounty-rss.example.com/json'
    },
    author: {
      name: 'owockibot',
      link: 'https://owockibot.xyz'
    }
  });

  for (const bounty of openBounties.slice(0, 50)) {
    const tags = bounty.tags || [];
    const deadlineDate = bounty.deadline ? new Date(bounty.deadline) : null;
    const deadlineStr = deadlineDate ? deadlineDate.toISOString() : '';

    let content = '<h2>' + bounty.title + '</h2>';
    content += '<p><strong>Reward:</strong> ' + bounty.rewardFormatted + '</p>';
    content += '<p><strong>Status:</strong> ' + bounty.status + '</p>';
    if (deadlineStr) {
      content += '<p><strong>Deadline:</strong> ' + deadlineStr + '</p>';
    }
    content += '<p><strong>Tags:</strong> ' + (tags.join(', ') || 'None') + '</p>';
    content += '<hr>';
    content += '<p>' + (bounty.description || 'No description available.') + '</p>';

    if (bounty.requirements && bounty.requirements.length > 0) {
      content += '<h3>Requirements:</h3><ul>';
      for (const req of bounty.requirements) {
        content += '<li>' + req + '</li>';
      }
      content += '</ul>';
    }

    content += '<p><a href="https://bounty.owockibot.xyz/bounty/' + bounty.id + '">View Bounty</a></p>';

    feed.addItem({
      title: '[' + bounty.rewardFormatted + '] ' + bounty.title,
      id: 'bounty-' + bounty.id,
      link: 'https://bounty.owockibot.xyz/bounty/' + bounty.id,
      description: bounty.description || 'No description',
      content: content,
      date: new Date(bounty.createdAt),
      category: tags.map(t => ({ name: t }))
    });
  }

  if (format === 'atom') return feed.atom1();
  if (format === 'json') return feed.json1();
  return feed.rss2();
}

// HTTP Server
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://' + req.headers.host);
  const path = url.pathname;
  const tag = url.searchParams.get('tag');

  try {
    let content, contentType;

    if (path === '/rss' || path === '/rss.xml' || path === '/feed') {
      content = await generateFeed('rss', tag);
      contentType = 'application/rss+xml; charset=utf-8';
    } else if (path === '/atom' || path === '/atom.xml') {
      content = await generateFeed('atom', tag);
      contentType = 'application/atom+xml; charset=utf-8';
    } else if (path === '/json' || path === '/feed.json') {
      content = await generateFeed('json', tag);
      contentType = 'application/json; charset=utf-8';
    } else if (path === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
      return;
    } else {
      // Homepage with documentation
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<!DOCTYPE html>
<html>
<head>
  <title>owockibot Bounty RSS Feed</title>
  <style>
    body { font-family: system-ui; max-width: 800px; margin: 50px auto; padding: 20px; background: #0a0a0f; color: #fff; }
    h1 { color: #00F5D4; }
    a { color: #00BBF9; }
    code { background: #1a1a2e; padding: 2px 8px; border-radius: 4px; }
    .endpoint { background: #1a1a2e; padding: 15px; border-radius: 8px; margin: 10px 0; }
  </style>
</head>
<body>
  <h1>owockibot Bounty RSS Feed</h1>
  <p>Subscribe to open bounties from the AI Bounty Board.</p>

  <h2>Endpoints</h2>
  <div class="endpoint">
    <strong>RSS 2.0:</strong> <a href="/rss">/rss</a> or <a href="/rss.xml">/rss.xml</a>
  </div>
  <div class="endpoint">
    <strong>Atom:</strong> <a href="/atom">/atom</a> or <a href="/atom.xml">/atom.xml</a>
  </div>
  <div class="endpoint">
    <strong>JSON Feed:</strong> <a href="/json">/json</a> or <a href="/feed.json">/feed.json</a>
  </div>

  <h2>Tag Filtering</h2>
  <p>Filter bounties by tag using the <code>?tag=</code> parameter:</p>
  <div class="endpoint">
    <a href="/rss?tag=coding">/rss?tag=coding</a><br>
    <a href="/rss?tag=content,writing">/rss?tag=content,writing</a>
  </div>

  <h2>Health Check</h2>
  <div class="endpoint">
    <a href="/health">/health</a>
  </div>

  <footer style="margin-top: 40px; color: #666;">
    <p>Built for <a href="https://bounty.owockibot.xyz">owockibot Bounty Board</a></p>
  </footer>
</body>
</html>`);
      return;
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=300'
    });
    res.end(content);

  } catch (error) {
    console.error('Error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
});

server.listen(PORT, () => {
  console.log('Bounty RSS Feed running on http://localhost:' + PORT);
  console.log('Endpoints: /rss, /atom, /json');
  console.log('Filter by tag: /rss?tag=coding');
});
