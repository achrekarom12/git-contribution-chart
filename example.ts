/**
 * example.ts — Quick smoke-test for the `github-contribution-chart` fetcher.
 *
 * Run with:
 *   npx tsx example.ts [username]
 *
 * Reads GITHUB_TOKEN automatically from a .env file in the project root.
 * The script will:
 *   1. Load env vars from .env via dotenv.
 *   2. Fetch the contribution calendar for a GitHub username.
 *   3. Print the total contribution count.
 *   4. Print a compact ASCII heatmap of the last 6 months to the terminal.
 *   5. Show the top-5 busiest days.
 */

import 'dotenv/config'; // loads .env into process.env before anything else
import { fetchGitHubContributions } from './src/fetcher';
import type { ContributionCalendar, ContributionDay } from './src/fetcher';

// ─── Config ───────────────────────────────────────────────────────────────────

const USERNAME = process.argv[2] ?? 'achrekarom12';
const MONTHS   = 6; // how many months back to display

// ─── ASCII heatmap helpers ────────────────────────────────────────────────────

/** Returns an ASCII shade character for a contribution count relative to the max. */
function toShade(count: number, max: number): string {
    if (count === 0 || max === 0) return '·';
    const ratio = count / max;
    if (ratio <= 0.15) return '░';
    if (ratio <= 0.40) return '▒';
    if (ratio <= 0.70) return '▓';
    return '█';
}

/** Filters days to the last `months` calendar months. */
function filterLastNMonths(calendar: ContributionCalendar, months: number): ContributionDay[] {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - months);

    return calendar.weeks
        .flatMap((w) => w.contributionDays)
        .filter((d) => new Date(d.date) >= cutoff);
}

/**
 * Renders a simple 7-row ASCII grid (Sun–Sat) showing the last N months.
 * Each column = one week; days are arranged top-to-bottom Sun→Sat.
 */
function renderAsciiHeatmap(calendar: ContributionCalendar, months: number): void {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - months);

    const weeks = calendar.weeks
        .map((w) => ({
            days: w.contributionDays.filter((d) => new Date(d.date) >= cutoff),
        }))
        .filter((w) => w.days.length > 0);

    const allCounts = weeks.flatMap((w) => w.days.map((d) => d.contributionCount));
    const max = Math.max(...allCounts, 1);

    // Build a 7-row grid (index = day-of-week 0=Sun … 6=Sat)
    const grid: string[][] = Array.from({ length: 7 }, () => []);

    for (const week of weeks) {
        // Fill a 7-slot column, blank where no day exists
        const col: (ContributionDay | null)[] = Array(7).fill(null);
        for (const day of week.days) {
            col[new Date(day.date).getDay()] = day;
        }
        for (let row = 0; row < 7; row++) {
            grid[row].push(col[row] ? toShade(col[row]!.contributionCount, max) : ' ');
        }
    }

    const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    console.log('\n  ── Contribution heatmap (last 6 months) ──\n');
    for (let row = 0; row < 7; row++) {
        console.log(`  ${DAY_LABELS[row]}  ${grid[row].join(' ')}`);
    }
    console.log('\n  Legend: · = 0  ░ = low  ▒ = medium  ▓ = high  █ = max\n');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
    console.log(`\n🔍  Fetching contributions for @${USERNAME} …\n`);

    const calendar = await fetchGitHubContributions(USERNAME);

    if (!calendar) {
        console.error('❌  Could not fetch data. Check that GITHUB_TOKEN is set correctly.');
        process.exit(1);
    }

    // ── 1. Summary ──────────────────────────────────────────────────────────
    console.log(`✅  Total contributions (last year): ${calendar.totalContributions}`);
    console.log(`    Weeks in response              : ${calendar.weeks.length}`);

    // ── 2. Last-N-months stats ───────────────────────────────────────────────
    const recentDays = filterLastNMonths(calendar, MONTHS);
    const recentTotal = recentDays.reduce((s, d) => s + d.contributionCount, 0);
    const activeDays  = recentDays.filter((d) => d.contributionCount > 0).length;
    console.log(`\n📅  Last ${MONTHS} months:`);
    console.log(`    Contributions : ${recentTotal}`);
    console.log(`    Active days   : ${activeDays} / ${recentDays.length}`);
    console.log(`    Streak avg    : ${(recentTotal / Math.max(activeDays, 1)).toFixed(1)} contributions/active day`);

    // ── 3. ASCII heatmap ────────────────────────────────────────────────────
    renderAsciiHeatmap(calendar, MONTHS);

    // ── 4. Top-5 busiest days ───────────────────────────────────────────────
    const top5 = [...recentDays]
        .sort((a, b) => b.contributionCount - a.contributionCount)
        .slice(0, 5);

    console.log('  🏆  Top 5 busiest days (last 6 months):');
    top5.forEach((d, i) => {
        console.log(`      ${i + 1}. ${d.date}  →  ${d.contributionCount} contributions`);
    });
    console.log();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
