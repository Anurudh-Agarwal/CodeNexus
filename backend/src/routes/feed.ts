import express from "express";
import { getFeed, createPost, searchQuestionsHandler } from "../controllers/feedController";
import { getUserPosts } from "../controllers/userController";
import { requireAuth } from "../middleware/auth";

const router= express.Router()

router.get('/questions/search', requireAuth , searchQuestionsHandler)
router.post('/posts',requireAuth, createPost)
router.get('/home',requireAuth, getFeed)

router.get('/:userId/posts', getUserPosts)

export default router