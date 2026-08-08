'use client'

import { useLeaderboard } from '@/hooks/useLeaderboard'
import { useState } from 'react'

interface LeaderboardFilters {
  year?: number
  branch?: string
}

export default function LeaderboardPage() {
  const [filters, setFilters] = useState<LeaderboardFilters>({ year: undefined, branch: undefined })
  const { entries, loading, error } = useLeaderboard(filters)
  return (
    <div className="p-6 border-3 mr-1 rounded-2xl" >
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
                <th className="border p-3 text-center">CF Rating</th>
                <th className="border p-3 text-center">LC Rating</th>
                <th className="border p-3 text-center">CC Rating</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="border p-3 font-bold">{entry.college_rank}</td>
                  <td className="border p-3">{entry.name}</td>
                  <td className="border p-3">{entry.year}</td>
                  <td className="border p-3">{entry.branch}</td>
                  <td className="border p-3 text-center">{entry.cf_rating}</td>
                  <td className="border p-3 text-center">{entry.lc_rating}</td>
                  <td className="border p-3 text-center">{entry.cc_rating}</td>
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