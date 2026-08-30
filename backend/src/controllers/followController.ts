import { Request, Response } from "express";
import { followUser, unfollowUser } from "../services/followService";

export async function follow(req: Request<{userId: string}>, res:Response){
    try{
        await followUser(req.user!.id, req.params.userId)
        res.status(200).json({success: true})
    }catch(err){
        console.error('Follow error', err)
        res.status(400).json({success: false, error: err instanceof Error ?err.message: 'Follow failed'})
    }
}

export async function unfollow(req: Request<{userId: string}>, res:Response){
    try{
        await unfollowUser(req.user!.id, req.params.userId)
        res.status(200).json({success: true})
    }catch(err){
        console.error('Unfollow error', err)
        res.status(400).json({success: false, error: err instanceof Error ? err.message: 'Unfollow failed'})
    }
}