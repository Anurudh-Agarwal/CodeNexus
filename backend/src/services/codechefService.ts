import * as cheerio from "cheerio";
import { codechefLimiter } from "../lib/rateLimiter";

const CODECHEF_PROFILE_URL = "https://www.codechef.com/users";

async function fetchCodeChefProfilePage(
  handle: string,
): Promise<cheerio.CheerioAPI> {
  return codechefLimiter.run(async () => {
    const response = await fetch(
      `${CODECHEF_PROFILE_URL}/${encodeURIComponent(handle)}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      },
    );
    if (!response.ok) {
      throw new Error(
        response.status === 404
          ? "CodeChef handle not found"
          : `CodeChef returned ${response.status}`,
      );
    }
    return cheerio.load(await response.text());
  });
}

export async function getCodeChefDisplayName(handle: string): Promise<string> {
  const $ = await fetchCodeChefProfilePage(handle);
  const rawName= $("h1").first().text().trim();
  return rawName
    .replace(/^\d+\s*★\s*/, "")
    .trim();
}

export async function fetchCodeChefStats(handle: string) {
  const $ = await fetchCodeChefProfilePage(handle);
  const solvedText = $("*:contains('Total Problems Solved:')")
    .last()
    .text()
    .replace("Total Problems Solved:", "")
    .trim();
  const solved = Number.parseInt(solvedText, 10);
  const ratingText = $(".rating-number").first().text().trim();
  const rating = Number.parseInt(ratingText, 10);
  const stars = $(".rating-star").first().text().trim();

  return {
    rating: Number.isFinite(rating) ? rating : null,
    rank: stars || null,
    total_solved: Number.isFinite(solved) ? solved : 0,
  };
}
