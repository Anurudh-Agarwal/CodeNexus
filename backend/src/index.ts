import express from 'express'
import cors from 'cors'
import leaderboardRoutes from './routes/leaderboard'

const app=express();
const PORT=5000

app.use(cors())
app.use(express.json())

app.get('/health', (req, res)=>{
    res.json({
        status:'ok',
        message:'CodeNexus backend is running',
        timestamp: new Date().toISOString
    })  
})

app.use('/api/leaderboard', leaderboardRoutes)

app.listen(PORT, ()=>{
    console.log(`server is running on http://localhost:${PORT}`)
})