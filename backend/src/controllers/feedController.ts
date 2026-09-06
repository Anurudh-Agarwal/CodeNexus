import { Response, Request } from "express"
import { findOrCreateQuestion, searchQuestions } from "../services/questionService"
import { createRevisionPost, getHomeFeed } from "../services/feedService"

export async function searchQuestionsHandler(req: Request, res: Response){
    try{
        const query= String(req.query.q || '')
        if(!query.trim()) return res.status(200).json({success: true, data: []})
        return res.status(200).json({success:true, data :await searchQuestions(query.trim())})
    }catch(err){
        console.error('Search questions error:', err)
        res.status(500).json({success: false, error: 'Internal server error' })
    }
}

export async function createPost(req: Request, res: Response){
    try{
        const userId = req.user!.id
        const {questionId, url , platform , note }= req.body
        let finalQuestionId=questionId
        if(!questionId){
            if(!platform || !url){
                res.status(400).json({success: false, error: 'url, platform are required for a new question' })
            }
            finalQuestionId = (await findOrCreateQuestion(userId, {url , platform})).id
        }
        const post = await createRevisionPost(userId, finalQuestionId, note||null)
        return res.status(200).json({success: true, data: post})
    }catch(err){
        res.status(400).json({success: false, error: err instanceof Error? err.message : 'Failed to create post '})
    }
}

export async function getFeed (req: Request, res: Response){
    try{
        res.status(200).json({success: true, data: await getHomeFeed(req.user!.id)})
    }catch(err){
        console.error('Get feed error: ', err);
        res.status(500).json({success: false, error: 'Internal server error'})
    }
}