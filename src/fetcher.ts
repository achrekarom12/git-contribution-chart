// ─── Types ───────────────────────────────────────────────────────────────────

export interface ContributionDay {
    contributionCount: number;
    date: string; // ISO date string, e.g. "2024-04-20"
}

export interface ContributionWeek {
    contributionDays: ContributionDay[];
}

export interface ContributionCalendar {
    totalContributions: number;
    weeks: ContributionWeek[];
}

// ─── GraphQL query ────────────────────────────────────────────────────────────

const QUERY = `
  query($userName: String!) {
    user(login: $userName) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
            }
          }
        }
      }
    }
  }
`;

// ─── Options ─────────────────────────────────────────────────────────────────

export interface FetchGitHubContributionsOptions {
    /**
     * GitHub personal-access token (needs `read:user` scope).
     * If omitted, the function tries `process.env.GITHUB_TOKEN` (Node.js only).
     */
    token?: string;
    /**
     * Custom fetch implementation (useful for Node < 18 or test mocking).
     * Falls back to the global `fetch`.
     */
    fetchFn?: typeof fetch;
}

// ─── Fetcher ─────────────────────────────────────────────────────────────────

/**
 * Fetches the GitHub contribution calendar for a user via the GraphQL API.
 *
 * @example
 * // Server component / Node.js
 * const calendar = await fetchGitHubContributions('achrekarom', { token: process.env.GITHUB_TOKEN });
 *
 * @example
 * // Browser (token injected server-side, or passed explicitly)
 * const calendar = await fetchGitHubContributions('achrekarom', { token: myToken });
 */
export async function fetchGitHubContributions(
    username: string,
    options: FetchGitHubContributionsOptions = {}
): Promise<ContributionCalendar | null> {
    const token =
        options.token ??
        (typeof process !== 'undefined' ? process.env?.GITHUB_TOKEN : undefined);

    if (!token) {
        console.warn(
            '[github-contribution-chart] No GitHub token provided — skipping fetch.\n' +
            'Pass a token via options.token or set the GITHUB_TOKEN env variable.'
        );
        return null;
    }

    const fetcher = options.fetchFn ?? fetch;

    try {
        const response = await fetcher('https://api.github.com/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `bearer ${token}`,
            },
            body: JSON.stringify({ query: QUERY, variables: { userName: username } }),
        });

        if (!response.ok) {
            throw new Error(`GitHub API responded with ${response.status} ${response.statusText}`);
        }

        const json = (await response.json()) as {
            data: {
                user: {
                    contributionsCollection: {
                        contributionCalendar: ContributionCalendar;
                    };
                };
            };
            errors?: { message: string }[];
        };

        if (json.errors?.length) {
            throw new Error(json.errors.map((e) => e.message).join(', '));
        }

        return json.data.user.contributionsCollection.contributionCalendar;
    } catch (error) {
        console.error('[github-contribution-chart] Failed to fetch contributions:', error);
        return null;
    }
}
