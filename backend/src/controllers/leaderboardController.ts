import { Request , Response } from 'express'
import { getleaderboardData } from "../services/leaderboardService";

export async function getLeaderboard(req: Request, res: Response){
    try{
        const year=req.query.year? parseInt (req.query.year as string) : undefined
        const branch =req.query.branch as string | undefined
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
        const leaderboardData=await getleaderboardData({year, branch});

        res.status(200).json({
            success: true,
            data: {
                entries: leaderboardData,
                total_users: leaderboardData.length,
                page: 1,
                page_size: 50
            },
            timestamp: new Date().toISOString()
        })
    }catch(error){
        console.error('Leaderboard error:', error)
        res.status(500).json({
            success: false, 
            error: 'Internal server error'
        })
    }
}