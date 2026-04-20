import React from 'react';
import { ContributionCalendar, ContributionWeek } from './fetcher';

// ─── Types ───────────────────────────────────────────────────────────────────

export type ColorScheme = 'dark' | 'light';
export type ContributionLevel = 0 | 1 | 2 | 3 | 4;

export interface GitHubContributionChartProps {
    /** The contribution calendar returned by `fetchGitHubContributions`. */
    calendar: ContributionCalendar | null;
    /** Color palette — defaults to `'dark'` (GitHub-style dark mode). */
    colorScheme?: ColorScheme;
    /** Number of recent months to display (default: `6`). */
    months?: number;
    /**
     * Custom per-level colors. Keys are 0–4 where 0 = no contributions.
     * Overrides both built-in dark and light palettes.
     */
    colors?: Partial<Record<ContributionLevel, string>>;
    /** Gap between cells in pixels (default: `4`). */
    gap?: number;
    /** Border-radius of each cell in pixels (default: `3`). */
    cellRadius?: number;
    /** Additional className applied to the wrapper element. */
    className?: string;
    /** Inline styles applied to the wrapper element. */
    style?: React.CSSProperties;
}

// ─── Default color palettes ───────────────────────────────────────────────────

const DARK_PALETTE: Record<ContributionLevel, string> = {
    0: '#161b22',
    1: '#0e4429',
    2: '#006d32',
    3: '#26a641',
    4: '#39d353',
};

const LIGHT_PALETTE: Record<ContributionLevel, string> = {
    0: '#ebedf0',
    1: '#9be9a8',
    2: '#40c463',
    3: '#30a14e',
    4: '#216e39',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getLevel(count: number, max: number): ContributionLevel {
    if (count === 0 || max === 0) return 0;
    const ratio = count / max;
    if (ratio <= 0.15) return 1;
    if (ratio <= 0.40) return 2;
    if (ratio <= 0.70) return 3;
    return 4;
}

/** Filters the weeks array to include only days within the last N months. */
function filterLastNMonths(weeks: ContributionWeek[], months: number): ContributionWeek[] {
    const now = new Date();
    const cutoff = new Date(now.getFullYear(), now.getMonth() - months, now.getDate());

    return weeks
        .map((week) => ({
            contributionDays: week.contributionDays.filter(
                (day) => new Date(day.date) >= cutoff
            ),
        }))
        .filter((week) => week.contributionDays.length > 0);
}

/** Returns the day-of-week index (0 = Sunday … 6 = Saturday) for an ISO date string. */
function getDayOfWeek(dateStr: string): number {
    return new Date(dateStr).getDay();
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * A zero-dependency React component that renders a GitHub-style contribution
 * heatmap grid.
 *
 * @example
 * <GitHubContributionChart calendar={calendar} colorScheme="dark" months={6} />
 */
export function GitHubContributionChart({
    calendar,
    colorScheme = 'dark',
    months = 6,
    colors: customColors,
    gap = 4,
    cellRadius = 3,
    className,
    style,
}: GitHubContributionChartProps): React.ReactElement | null {
    if (!calendar) return null;

    const basePalette = colorScheme === 'dark' ? DARK_PALETTE : LIGHT_PALETTE;
    const palette: Record<ContributionLevel, string> = {
        ...basePalette,
        ...customColors,
    } as Record<ContributionLevel, string>;

    const filteredWeeks = filterLastNMonths(calendar.weeks, months);
    const numCols = filteredWeeks.length;

    const max = filteredWeeks.reduce((acc, week) => {
        const weekMax = week.contributionDays.reduce(
            (a, d) => Math.max(a, d.contributionCount),
            0
        );
        return Math.max(acc, weekMax);
    }, 0);

    return (
        <div
            className={className}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                ...style,
            }}
        >
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${numCols}, 1fr)`,
                    gridTemplateRows: 'repeat(7, auto)',
                    gap: `${gap}px`,
                    width: '100%',
                }}
            >
                {filteredWeeks.map((week, wi) =>
                    week.contributionDays.map((day) => {
                        const level = getLevel(day.contributionCount, max);
                        const row = getDayOfWeek(day.date);
                        const label = `${day.date}: ${day.contributionCount} contribution${day.contributionCount !== 1 ? 's' : ''}`;
                        return (
                            <div
                                key={day.date}
                                title={label}
                                aria-label={label}
                                role="img"
                                style={{
                                    gridColumn: wi + 1,
                                    gridRow: row + 1,
                                    borderRadius: `${cellRadius}px`,
                                    backgroundColor: palette[level],
                                    aspectRatio: '1',
                                }}
                            />
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default GitHubContributionChart;
