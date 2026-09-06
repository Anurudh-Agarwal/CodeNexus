import * as cheerio from 'cheerio'
import { supabase } from "../lib/supabase";

const PROBLEM_URL_PATTERNS: Record<string, RegExp> = {
  'codeforces.com': /\/(contest|problemset\/problem)\/\d+\/(problem\/)?[A-Z]\d*/i,
  'leetcode.com': /\/problems\/[a-z0-9-]+/i,
  'codechef.com': /\/problems\/[A-Z0-9]+/i,
  'geeksforgeeks.org': /\/problems\/[a-z0-9-]+/i,
  'atcoder.jp': /\/contests\/[a-z0-9_-]+\/tasks\/[a-z0-9_-]+/i,
  'naukri.com': /\/job-listings-[a-z0-9-]+/i,
};

function isRealProblemUrl(url: string): boolean {
  try {
    const { hostname, pathname } = new URL(url)
    const domain = Object.keys(PROBLEM_URL_PATTERNS).find((d) => hostname === d || hostname.endsWith(`.${d}`))
    if (!domain) return false
    return PROBLEM_URL_PATTERNS[domain].test(pathname)
  } catch {
    return false
  }
}

async function fetchRealPageTitle(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
  })
  if (!res.ok) {
    throw new Error("This link couldn't be verified — the page doesn't exist")
  }

  const html = await res.text()
  const $ = cheerio.load(html)
  const title = $('title').text().trim()

  if (!title) {
    throw new Error("Couldn't read a title from this page — is it a real problem link?")
  }
  return title
}

export async function searchQuestions(query : string){
    const {data, error} = await supabase.from('questions').select('*').ilike('title', `%${query}%`).limit(10)
    if (error) throw error
    return data
}

export async function findOrCreateQuestion(
    userId:string,
    {url , platform}: {url: string, platform: string}
){
    if(!isRealProblemUrl(url)){
        throw new Error('This doesn\'t look like a real problem link. Please check the URL.')
    }
    const {data: existing , error: findError}= await supabase.from('questions').select('*').eq('url', url).maybeSingle()
    if(findError) throw findError
    if(existing) return existing

    const title = await fetchRealPageTitle(url)

    const { data: created, error: insertError}= await supabase
        .from('questions')
        .insert({url, title,platform, added_by: userId})
        .select()
        .maybeSingle()

    if(insertError) throw insertError
    return created 
} 