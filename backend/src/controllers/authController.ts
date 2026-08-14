import { supabase } from "../lib/supabase";
import { registerUser, loginUser } from "../services/authService";
import { Request, Response } from "express";

export async function signUp(req: Request, res: Response){
    try{
        const { name , password, email , year , branch }= req.body
    
        if(!email.endsWith('@ietlucknow.ac.in')){
            res.status(400).json({
                success: false,
                error: 'Only @ietlucknow.ac.in emails allowed'
            })
        }
    
        if(!name || !password || !email){
            res.status(400).json({
                success: false,
                error: 'Email, password, email are required'
            })
        }
    
        const result = await registerUser({ email , name , password, year , branch});

        res.status(201).json({
            success: true,
            data: {
                user: result.user,
                token: result.token
            }
        })
    }catch(err: any){
        console.log('SignUp error : ', err)
        res.status(500).json({
            success: false,
            error: err.message || 'SignUp failed'
        })
    }
}

export async function logIn( req: Request, res: Response){
    try{
        const { email, password }= req.body
        if(!email || !password ){ 
            res.status(400).json({
                success: false,
                error: 'Email and Password required'
            })
        }
        const result = await loginUser({email , password})

        res.status(201).json({
            success: true,
            data:{
                user: result.user,
                token: result.token
            }
        })
    }catch(err: any){
        res.status(500).json({
            success: false ,
            error: err.message || 'Invaid credentials'
        })
    }
}