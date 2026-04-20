# github-contribution-chart

A tiny, headless npm package that:
1. **Fetches** your GitHub contribution data via the GraphQL API.
2. **Renders** it as a heatmap grid using a zero-dependency React component.

No third-party chart library required. Full TypeScript support.

---

> **Peer dependency:** React ≥ 17 is required only if you use the `<GitHubContributionChart>` component.

---

## Usage

### 1. Fetch data (server-side / Node.js)

```ts
import { fetchGitHubContributions } from 'github-contribution-chart';

// Token is read from options.token, or process.env.GITHUB_TOKEN
const calendar = await fetchGitHubContributions('your-github-username', {
    token: process.env.GITHUB_TOKEN,
});
```

### 2. Render the chart (React)

```tsx
import { GitHubContributionChart } from 'github-contribution-chart';

export default function MyPage() {
    return (
        <GitHubContributionChart
            calendar={calendar}
            colorScheme="dark"  // 'dark' | 'light'
            months={6}          // how many recent months to show
        />
    );
}
```

### 3. Next.js Server Component example

```tsx
// app/page.tsx
import { fetchGitHubContributions, GitHubContributionChart } from 'github-contribution-chart';

export default async function Page() {
    const calendar = await fetchGitHubContributions('achrekarom');

    return (
        <div style={{ width: '100%', height: 120 }}>
            <GitHubContributionChart calendar={calendar} colorScheme="dark" />
        </div>
    );
}
```

---

## API Reference

### `fetchGitHubContributions(username, options?)`

| Parameter | Type | Description |
|---|---|---|
| `username` | `string` | GitHub username |
| `options.token` | `string` | GitHub PAT (`read:user` scope). Falls back to `process.env.GITHUB_TOKEN`. |
| `options.fetchFn` | `typeof fetch` | Custom fetch implementation (for Node < 18 or testing). |

**Returns:** `Promise<ContributionCalendar | null>`

---

### `<GitHubContributionChart>` Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `calendar` | `ContributionCalendar \| null` | — | Data from `fetchGitHubContributions` |
| `colorScheme` | `'dark' \| 'light'` | `'dark'` | Built-in color palette |
| `months` | `number` | `6` | Recent months to display |
| `colors` | `Partial<Record<0\|1\|2\|3\|4, string>>` | — | Override per-level colors |
| `gap` | `number` | `4` | Cell gap in pixels |
| `cellRadius` | `number` | `3` | Cell border-radius in pixels |
| `className` | `string` | — | Wrapper CSS class |
| `style` | `CSSProperties` | — | Wrapper inline styles |

---

## GitHub Token

Create a fine-grained token at [github.com/settings/tokens](https://github.com/settings/tokens) with **read-only** access to your public data. Set it as `GITHUB_TOKEN` in your environment.

---

## License

MIT © Om Achrekar
