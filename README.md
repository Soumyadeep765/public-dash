# TeleDevs

TeleDevs is the public directory and showcase layer for [TeleBotHost](https://telebothost.com) developers and Telegram bots. It lets visitors browse developer profiles, open public bot repositories, inspect commands, and fork templates directly into their console. You can see it live at [teledevs.me](https://teledevs.me).

## Key features

* **Explore directory**: Filter and browse between curated community store listings and developer templates.
* **Developer profiles**: Custom profiles displaying public bots, community store listings, and account statistics.
* **Code inspector**: Browse the file trees, commands, and README files of published bots exactly like a code repository.
* **Clean config views**: See the required environment variable keys and placeholders needed for a bot without exposing any secret tokens or credentials.
* **Console integration**: Fork templates and bots straight into the TeleBotHost console with a single click.
* **Cross-domain session bridge**: Secure account hints across domains using an iframe bridge (`/explore-bridge`) so logged-in users get a smooth transition between the main app, console, and show directory.

## Tech stack

* **Framework**: Next.js (App Router)
* **Language**: TypeScript
* **Styling**: Tailwind CSS (v4) & CSS Variables
* **Content rendering**: React Markdown with GFM, rehype-raw, and rehype-sanitize for safe custom content rendering
* **Syntax highlighting**: Highlight.js for rendering bot command source code

## Get started locally

### 1. Clone & install dependencies
First, clone the repository and install the npm packages:

```bash
npm install
```

### 2. Configure environment variables
Copy the template file to set up your local environment variables:

```bash
cp .env.example .env.local
```

Open `.env.local` and make sure it has the correct endpoints:

```env
# TeleBotHost public API endpoint
NEXT_PUBLIC_TBH_API_BASE=https://api.telebothost.com/api/v1

# The URL of your local show directory
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Main marketing site
NEXT_PUBLIC_MAIN_SITE_URL=https://telebothost.com

# TeleBotHost Console URL (for login, signup, and session bridging)
NEXT_PUBLIC_CONSOLE_URL=http://localhost:3030
```

### 3. Run the development server
Start the local Next.js server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Production settings

When preparing for deployment, set these environment variables in your hosting provider (like Vercel):

```env
NEXT_PUBLIC_TBH_API_BASE=https://api.telebothost.com/api/v1
NEXT_PUBLIC_SITE_URL=https://teledevs.me
NEXT_PUBLIC_CONSOLE_URL=https://console.telebothost.com
NEXT_PUBLIC_MAIN_SITE_URL=https://telebothost.com
```

> [!IMPORTANT]
> The TeleBotHost Console must serve `/explore-bridge` so domain cookies can communicate cross-site. This handles the session hints that tell the header whether the user is logged in.

## Project routing

Here is how pages are routed in this repository:

| Route | Component File | Description |
| :--- | :--- | :--- |
| `/` | `src/app/page.tsx` | Main landing page highlighting featured templates and top bots |
| `/explore` | `src/app/explore/page.tsx` | Interactive directory supporting tabs for community store listings and templates |
| `/templates` | `src/app/templates/page.tsx` | Dedicated view for templates and shareable blueprints |
| `/search` | `src/app/search/page.tsx` | Global search for developer profiles and published bots |
| `/login` | `src/app/login/page.tsx` | Handles cross-site authentication redirects |
| `/about` | `src/app/about/page.tsx` | About page explaining the project |
| `/how-it-works` | `src/app/how-it-works/page.tsx` | Informative breakdown of the publishing and hosting flow |
| `/faq` | `src/app/faq/page.tsx` | Answers to common developer questions |
| `/upgrade` | `src/app/upgrade/page.tsx` | Details about plans and hosting limits |
| `/[username]` | `src/app/[username]/page.tsx` | Developer profile showing their published bots and details |
| `/[username]/b/[botId]` | `src/app/[username]/b/[botId]/page.tsx` | Detail view of a bot showcasing its README, command structure, and configuration keys |

## Custom development

If you need custom bot development or help with your setup, you can reach out on Telegram at [t.me/ondndbro](https://t.me/ondndbro).

## Contributing

We welcome contributions of all kinds. Whether you are fixing bugs, proposing new features, or improving documentation, your contributions will help us improve the platform. Feel free to open issues or submit pull requests.
