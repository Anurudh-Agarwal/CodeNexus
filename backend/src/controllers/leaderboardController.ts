import { Request , Response } from 'express'
import { getleaderboardData } from "../services/leaderboardService";

export async function getLeaderboard(req: Request, res: Response){
    try{
        const year=req.query.year? parseInt (req.query.year as string) : undefined
        const branch =req.query.branch as string | undefined
        const platform= req.query.platform as string | undefined

        if(year && (year<0 || year>4)){
            return res.status(400).json({
                success: false,
                error: 'Year must be between 1 and 4'
            })
        }
        const validBranches = ['CSE-R', 'CSE-AI', 'CSE-SF', 'ECE', 'EE', 'ME', 'CE', 'CHE']
        if(branch && !validBranches.includes(branch)){
            return res.status(400).json({
                success: false, 
                error:'Invalid branch'
            })
        }
        const validPlatform = ['codechef', 'codeforces', 'leetcode']
        if(platform && !validPlatform.includes(platform)){
            return res.status(400).json({
                success: false,
                error: 'Invalid platform'
            })
        }
        const leaderboardData=await getleaderboardData({year, branch, platform});

        res.status(200).json({
            success: true,
            data: {
                entries: leaderboardData,
                total_users: leaderboardData.length,
                filtered_by:{
                    year: year|| 'all',
                    branch: branch|| 'all',
                    platform: platform|| 'all',
                },
                sorted_by: platform? `${platform}_solved`: 'total_solved'
                }
        })
    }catch(error){
        console.error('Leaderboard error:', error)
        res.status(500).json({
            success: false, 
            error: 'Internal server error'
        })
    }
}