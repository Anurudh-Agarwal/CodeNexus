'use client'

import { useLeaderboard } from '@/hooks/useLeaderboard'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useState } from 'react'
import { LeaderboardFilters } from '@/types'

type PlatformKey = 'codechef' | 'codeforces' | 'leetcode'

const PLATFORM_FIELD: Record<PlatformKey, 'cc_solved' | 'lc_solved' | 'cf_solved'> = {
  codechef: 'cc_solved',
  codeforces: 'cf_solved',
  leetcode: 'lc_solved',
}

export default function LeaderboardPage() {
  const [filters, setFilters] = useState<LeaderboardFilters>({ year: undefined, branch: undefined, platform: undefined })
  const { entries, loading, error } = useLeaderboard(filters)
  const isMobile = useIsMobile()
  const platform = filters.platform as PlatformKey | undefined

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>

      <div className="mb-6 flex gap-4">
        <select
          value={filters.year || ''}
          onChange={(e) =>
            setFilters({ ...filters, year: e.target.value ? parseInt(e.target.value) : undefined })
          }
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">All Years</option>
          <option value="1">Year 1</option>
          <option value="2">Year 2</option>
          <option value="3">Year 3</option>
          <option value="4">Year 4</option>
        </select>

        <select
          value={filters.branch || ''}
          onChange={(e) => setFilters({ ...filters, branch: e.target.value || undefined })}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">All Branches</option>
          <option value="CSE-R">CSE-R</option>
          <option value="CSE-AI">CSE-AI</option>
          <option value="CSE-SF">CSE-SF</option>
          <option value="ECE">ECE</option>
        </select>

        <select
          value={filters.platform || ''}
          onChange={(e) => setFilters({ ...filters, platform: (e.target.value || undefined) as PlatformKey | undefined })}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">All Platforms</option>
          <option value="codechef">CodeChef</option>
          <option value="codeforces">CodeForces</option>
          <option value="leetcode">LeetCode</option>
        </select>
      </div>

      {loading && <div className="text-center text-gray-500">Loading leaderboard...</div>}

      {error && <div className="text-center text-red-500">Error: {error}</div>}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-3 text-left">Rank</th>
                <th className="border p-3 text-left">Name</th>
                <th className="border p-3 text-left">Year</th>
                <th className="border p-3 text-left">Branch</th>

                {!isMobile && !platform && (
                  <>
                    <th className="border p-3 text-center">CC Solved</th>
                    <th className="border p-3 text-center">LC Solved</th>
                    <th className="border p-3 text-center">CF Solved</th>
                  </>
                )}

                {!platform && (
                  <th className="border p-3 text-center">Total Solved</th>
                )}

                {platform && (
                  <th className="border p-3 text-center capitalize">
                    {platform} Solved
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="border p-3 font-bold">{entry.rank}</td>
                  <td className="border p-3">{entry.name}</td>
                  <td className="border p-3">{entry.year}</td>
                  <td className="border p-3">{entry.branch}</td>

                  {!isMobile && !platform && (
                    <>
                      <td className="border p-3 text-center">{entry.cc_solved}</td>
                      <td className="border p-3 text-center">{entry.lc_solved}</td>
                      <td className="border p-3 text-center">{entry.cf_solved}</td>
                    </>
                  )}

                  {!platform && (
                    <td className="border p-3 text-center">{entry.total_solved}</td>
                  )}

                  {platform && (
                    <td className="border p-3 text-center">
                      {entry[PLATFORM_FIELD[platform]]}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && entries.length === 0 && (
        <div className="text-center text-gray-500">No users found with selected filters</div>
      )}
    </div>
  )
}