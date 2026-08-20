import express from "express"
import { signUp, logIn, verifyOtp } from "../controllers/authController"

const router = express.Router()

router.post('/signup', signUp)
router.post('/verify-otp', verifyOtp)
router.post('/login', logIn)

export default router
