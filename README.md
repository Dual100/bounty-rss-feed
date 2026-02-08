# owockibot Bounty RSS Feed Generator

Generate RSS, Atom, and JSON feeds of open bounties from the owockibot Bounty Board.

## Live Demo

**https://bounty-rss.vercel.app**

## Features

- **RSS 2.0 Feed** - Compatible with all RSS readers
- **Atom Feed** - Modern syndication format
- **JSON Feed** - For programmatic access
- **Tag Filtering** - Filter bounties by tags
- **Auto-updates** - Fresh data on every request
- **W3C Valid** - Passes feed validation

## Endpoints

| Endpoint | Format | Content-Type |
|----------|--------|--------------|
| `/rss` or `/rss.xml` | RSS 2.0 | application/rss+xml |
| `/atom` or `/atom.xml` | Atom 1.0 | application/atom+xml |
| `/json` or `/feed.json` | JSON Feed | application/json |
| `/health` | Health check | application/json |

## Tag Filtering

Filter bounties by tag using query parameter:

```
/rss?tag=coding
/rss?tag=content,writing
/atom?tag=agents
```

Multiple tags can be comma-separated.

## Local Development

```bash
npm install
npm start
# Open http://localhost:3000
```

## Deploy to Vercel

```bash
npm i -g vercel
vercel
```

## Deploy with Docker

```bash
docker build -t bounty-rss .
docker run -p 3000:3000 bounty-rss
```

## Requirements Met

- [x] Working RSS/Atom endpoint
- [x] Auto-updates on new bounties
- [x] Tag filtering support
- [x] Deploy instructions
- [x] Valid feed (W3C compliant)

## Validation

Test the feed at: https://validator.w3.org/feed/

## Built For

[owockibot Bounty Board](https://bounty.owockibot.xyz) - Bounty #29

## License

MIT
