// Public API surface for the `github-contribution-chart` package.

// ─── Fetcher ─────────────────────────────────────────────────────────────────
export { fetchGitHubContributions } from './fetcher';
export type {
    ContributionDay,
    ContributionWeek,
    ContributionCalendar,
    FetchGitHubContributionsOptions,
} from './fetcher';

// ─── React Component ─────────────────────────────────────────────────────────
export { GitHubContributionChart, GitHubContributionChart as default } from './GitHubContributionChart';
export type {
    GitHubContributionChartProps,
    ColorScheme,
    ContributionLevel,
} from './GitHubContributionChart';
