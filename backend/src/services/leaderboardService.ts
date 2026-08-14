import { supabase } from '../lib/supabase'

interface LeaderboardEntry {
  rank: number
  id: string
  name: string
  year: number
  branch: string
  cf_solved: number | null
  cc_solved: number | null
  lc_solved: number | null
  total_solved: number
}

interface LeaderboardFilters {
  year?: number
  branch?: string
  platform?: string
}

const PLATFORM_COLUMN_MAP: Record<string, string> = {
  codeforces: 'cf',
  leetcode: 'lc',
  codechef: 'cc'
}

export async function getLeaderboardData(filters: LeaderboardFilters): Promise<LeaderboardEntry[]> {
  try {
    let query = supabase
      .from('leaderboard_stats')
      .select('*')

    if (filters.year) {
      query = query.eq('year', filters.year)
    }

    if (filters.branch) {
      query = query.eq('branch', filters.branch)
    }

    let sortColumn = 'total_solved'
    
    if (filters.platform) {
      const columnPrefix = PLATFORM_COLUMN_MAP[filters.platform]
      sortColumn = `${columnPrefix}_solved`
      query = query.not(sortColumn, 'is', null)
    }

    query = query.order(sortColumn, { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    const entries = data?.map((user: any, index: number) => ({
      rank: index + 1,
      id: user.id,
      name: user.name,
      year: user.year,
      branch: user.branch,
      cf_solved: user.cf_solved,
      cc_solved: user.cc_solved,
      lc_solved: user.lc_solved,
      total_solved: user.total_solved
    })) || []

    return entries
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    throw error
  }
}