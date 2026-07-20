# TeleDevs

Public showcase for [TeleBotHost](https://telebothost.com) developers and bots — live at [teledevs.me](https://teledevs.me).

## Features

- Browse community store and templates
- Developer profiles and bot source views
- Light and dark themes
## Production

| App | URL |
|-----|-----|
| TeleDevs | https://teledevs.me |
| Console | https://console.telebothost.com |
| API | https://api.telebothost.com/api/v1 |

Required env (also in Vercel project settings):

```bash
NEXT_PUBLIC_TBH_API_BASE=https://api.telebothost.com/api/v1
NEXT_PUBLIC_SITE_URL=https://teledevs.me
NEXT_PUBLIC_CONSOLE_URL=https://console.telebothost.com
NEXT_PUBLIC_MAIN_SITE_URL=https://telebothost.com
```

Point the `teledevs.me` domain at this Next.js deployment. Console must serve `/explore-bridge` so signed-in account hints work across domains.

## Develop

```bash
npm install
npm run dev
```

For local console session bridge, override:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_CONSOLE_URL=http://localhost:3030
```

## Routes

| Path | Description |
|------|-------------|
| `/` | Home |
| `/login` | Sign in / switch via TeleBotHost |
| `/about` | About TeleDevs |
| `/how-it-works` | Publish flow |
| `/faq` | FAQ |
| `/upgrade` | Plans |
| `/explore` | Community store |
| `/templates` | Public templates |
| `/[username]` | Developer profile (Overview) |
| `/[username]?tab=bots` | Developer bots tab (`?bots` also works) |
| `/[username]/b/[botId]` | Bot source view (Fork → console `#fork/{id}`) |
| `/search` | Search |
