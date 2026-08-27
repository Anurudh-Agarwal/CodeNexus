import express from 'express'
import { requestCodeforcesSync, verifyCodeforcesSync, triggerResyncAll, getCodeforcesStatus, refreshOwnCodeforces } from '../controllers/syncController'
import { requireAuth } from '../middleware/auth'
import { requireCronSecret } from '../middleware/requireCronSecret'

const router= express.Router()
router.post('/codeforces/request', requireAuth, requestCodeforcesSync)
router.post('/codeforces/verify', requireAuth, verifyCodeforcesSync)
router.post('/cron/resync-all', requireCronSecret, triggerResyncAll)
router.get('/codeforces/status', requireAuth, getCodeforcesStatus)
router.post('/codeforces/refresh', requireAuth, refreshOwnCodeforces)
export default router