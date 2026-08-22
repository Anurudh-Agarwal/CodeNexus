import { Request, Response } from "express";
import { fetchUserProfile } from "../services/userService";

export async function getUserProfile(req: Request<{ userId: string }>, res: Response){
    try{
        const { userId } = req.params;
        if(!userId){
            return res.status(400).json({success:false, error: 'User ID is required'})
        }

        const profile= await fetchUserProfile(userId)
        
        if(!profile){
            return res.status(400).json({success: false, error: 'User not found'})
        }

        res.status(200).json({success: true, data: profile})
    }catch(err){
        console.error('Profile error: ', err)
        res.status(500).json({success: false, error: 'Internal Server Error'});
    }
}