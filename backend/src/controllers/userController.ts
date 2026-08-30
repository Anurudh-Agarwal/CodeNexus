import { Request, Response } from "express";
import { fetchUserProfile } from "../services/userService";
import { supabase } from "../lib/supabase";

export async function getUserProfile(req: Request<{ userId: string }>, res: Response){
    try{
        const { userId } = req.params;
        if(!userId){
            return res.status(400).json({success:false, error: 'User ID is required'})
        }
        const authHeader = req.headers.authorization
        const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
        let viewerId: string | null = null
        if (token) {
            const { data } = await supabase.auth.getUser(token)
            viewerId = data.user?.id ?? null
        }
        const profile= await fetchUserProfile(userId, viewerId)
        
        if(!profile){
            return res.status(400).json({success: false, error: 'User not found'})
        }

        res.status(200).json({success: true, data: profile})
    }catch(err){
        console.error('Profile error: ', err)
        res.status(500).json({success: false, error: 'Internal Server Error'});
    }
}