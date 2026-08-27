import { leetcodeLimiter } from "../lib/rateLimiter";

const LC_GRAPHQL_URL = "https://leetcode.com/graphql";

interface LeetCodeGraphQLResponse {
  data?: {
    matchedUser: {
      profile: { aboutMe?: string | null; ranking?: number | null };
      submitStats: {
        acSubmissionNum: Array<{ difficulty: string; count: number }>;
      };
      submissionCalendar?: string | null;
    } | null;
  };
  errors?: Array<{ message: string }>;
}

async function queryLeetCode(
  username: string,
): Promise<NonNullable<LeetCodeGraphQLResponse["data"]>> {
  return leetcodeLimiter.run(async () => {
    const response = await fetch(LC_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Referer: "https://leetcode.com",
      },
      body: JSON.stringify({
        query: `
          query getUserProfile($username: String!) {
            matchedUser(username: $username) {
              profile { aboutMe ranking }
              submitStats: submitStatsGlobal {
                acSubmissionNum { difficulty count }
              }
              submissionCalendar
            }
          }
        `,
        variables: { username },
      }),
    });

    if (!response.ok) {
      throw new Error(`LeetCode API request failed (${response.status})`);
    }

    const json = (await response.json()) as LeetCodeGraphQLResponse;
    if (json.errors?.length) throw new Error(json.errors[0].message);
    if (!json.data?.matchedUser) throw new Error("LeetCode handle not found");
    return json.data;
  });
}

export async function getLeetCodeAboutMe(username: string): Promise<string> {
  const data = await queryLeetCode(username);
  return data.matchedUser?.profile.aboutMe || "";
}

export async function fetchLeetCodeStats(username: string) {
  const data = await queryLeetCode(username);
  const matchedUser = data.matchedUser!;
  const total =
    matchedUser.submitStats.acSubmissionNum.find(
      (submission) => submission.difficulty === "All",
    )?.count ?? 0;
  let calendar: Record<string, number> = {};
  try {
    calendar = JSON.parse(matchedUser.submissionCalendar || "{}");
  } catch {
    throw new Error("LeetCode returned an invalid submission calendar");
  }

  const activeDayTimestamps = Object.keys(calendar)
    .filter((timestamp) => calendar[timestamp] > 0)
    .map((timestamp) => Number.parseInt(timestamp, 10))
    .filter(Number.isFinite);
  const nowSeconds = Math.floor(Date.now() / 1000);
  const thirtyDays = 30 * 24 * 60 * 60;
  const year = 365 * 24 * 60 * 60;
  const monthly_solved = activeDayTimestamps.filter(
    (timestamp) => nowSeconds - timestamp <= thirtyDays,
  ).length;
  const yearly_solved = activeDayTimestamps.filter(
    (timestamp) => nowSeconds - timestamp <= year,
  ).length;
  const { current_streak, longest_streak } =
    computeStreaksFromDayTimestamps(activeDayTimestamps);

  return {
    rating: null,
    rank: matchedUser.profile.ranking ?? null,
    total_solved: total,
    monthly_solved,
    yearly_solved,
    current_streak,
    longest_streak,
  };
}

function computeStreaksFromDayTimestamps(timestamps: number[]) {
  if (timestamps.length === 0) {
    return { current_streak: 0, longest_streak: 0 };
  }
  const secondsPerDay = 86400;
  const dayNumbers = Array.from(
    new Set(
      timestamps.map((timestamp) => Math.floor(timestamp / secondsPerDay)),
    ),
  ).sort((a, b) => a - b);
  let longest_streak = 1;
  let run = 1;
  for (let index = 1; index < dayNumbers.length; index += 1) {
    run = dayNumbers[index] === dayNumbers[index - 1] + 1 ? run + 1 : 1;
    longest_streak = Math.max(longest_streak, run);
  }
  const todayDayNumber = Math.floor(Date.now() / 1000 / secondsPerDay);
  const lastActiveDay = dayNumbers[dayNumbers.length - 1];
  if (todayDayNumber - lastActiveDay > 1) {
    return { current_streak: 0, longest_streak };
  }
  let current_streak = 1;
  for (let index = dayNumbers.length - 1; index > 0; index -= 1) {
    if (dayNumbers[index] === dayNumbers[index - 1] + 1) current_streak += 1;
    else break;
  }
  return { current_streak, longest_streak };
}
