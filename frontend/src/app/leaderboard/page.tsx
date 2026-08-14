'use client'

import { useLeaderboard } from '@/hooks/useLeaderboard'
import { useState } from 'react'
import { LeaderboardFilters } from '@/types'

type PlatformKey = 'codechef' | 'codeforces' | 'leetcode'

const PLATFORM_FIELD: Record<PlatformKey, 'cc_solved' | 'lc_solved' | 'cf_solved'> = {
  codechef: 'cc_solved',
  codeforces: 'cf_solved',
  leetcode: 'lc_solved',
}

const PLATFORM_LABEL: Record<PlatformKey, string> = {
  codechef: 'CodeChef',
  codeforces: 'Codeforces',
  leetcode: 'LeetCode',
}

function formatSolved(value: number | null | undefined): string {
  return value === null || value === undefined ? '---' : String(value)
}

export default function LeaderboardPage() {
  const [filters, setFilters] = useState<LeaderboardFilters>({ year: undefined, branch: undefined, platform: undefined })
  const { entries, loading, error } = useLeaderboard(filters)
  const platform = filters.platform as PlatformKey | undefined

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Leaderboard</h1>

      <div className="mb-6 flex flex-wrap gap-2 md:gap-4">
        <select
          value={filters.year || ''}
          onChange={(e) =>
            setFilters({ ...filters, year: e.target.value ? parseInt(e.target.value) : undefined })
          }
          className="px-3 py-2 text-sm md:text-base border rounded-lg"
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
          className="px-3 py-2 text-sm md:text-base border rounded-lg"
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
          className="px-3 py-2 text-sm md:text-base border rounded-lg"
        >
          <option value="">All Platforms</option>
          <option value="codechef">CodeChef</option>
          <option value="codeforces">CodeForces</option>
          <option value="leetcode">LeetCode</option>
        </select>
      </div>

      {loading && <div className="text-center text-gray-500 py-8">Loading leaderboard...</div>}
      {error && <div className="text-center text-red-500 py-8">Error: {error}</div>}

      {!loading && !error && entries.length > 0 && (
        <>
          {/* DESKTOP: full table, hidden below md */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse border border-black">
              <thead className="bg-teal-200">
                <tr>
                  <th className="border p-3 text-left">Rank</th>
                  <th className="border p-3 text-left">Name</th>
                  <th className="border p-3 text-left">Year</th>
                  <th className="border p-3 text-left">Branch</th>

                  {!platform && (
                    <>
                      <th className="border p-3 text-center">CC Solved</th>
                      <th className="border p-3 text-center">LC Solved</th>
                      <th className="border p-3 text-center">CF Solved</th>
                      <th className="border p-3 text-center">Total Solved</th>
                    </>
                  )}

                  {platform && (
                    <th className="border p-3 text-center">
                      {PLATFORM_LABEL[platform]} Solved
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

                    {!platform && (
                      <>
                        <td className="border p-3 text-center">{formatSolved(entry.cc_solved)}</td>
                        <td className="border p-3 text-center">{formatSolved(entry.lc_solved)}</td>
                        <td className="border p-3 text-center">{formatSolved(entry.cf_solved)}</td>
                        <td className="border p-3 text-center font-bold text-blue-600">{entry.total_solved}</td>
                      </>
                    )}

                    {platform && (
                      <td className="border p-3 text-center font-bold">
                        {formatSolved(entry[PLATFORM_FIELD[platform]])}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {entries.map((entry) => (
              <div key={entry.id} className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-xl font-bold text-blue-600">#{entry.rank}</span>
                  <span className="font-semibold">{entry.name}</span>
                </div>
                <div className="text-xs text-gray-600 mb-3">
                  Year {entry.year} • {entry.branch}
                </div>

                <div className="bg-gray-50 rounded p-3 text-center">
                  {!platform ? (
                    <>
                      <p className="text-xs text-gray-600">Total Solved</p>
                      <p className="text-2xl font-bold text-blue-600">{entry.total_solved}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-gray-600">{PLATFORM_LABEL[platform]} Solved</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatSolved(entry[PLATFORM_FIELD[platform]])}
                      </p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && !error && entries.length === 0 && (
        <div className="text-center text-gray-500 py-8">No users found with selected filters</div>
      )}
    </div>
  )
}