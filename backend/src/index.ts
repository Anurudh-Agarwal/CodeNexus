import express from 'express'
import cors from 'cors'
import leaderboardRoutes from './routes/leaderboard'
import dotenv from 'dotenv'
dotenv.config()
    const app=express();

const PORT=process.env.PORT

app.use(cors({
    origin:"https://codenexus-lg9o.onrender.com/"
}))
app.use(express.json())

app.get('/health', (req, res)=>{
    res.json({
        status:'ok',
        message:'CodeNexus backend is running',
        timestamp: new Date().toISOString
    })  
})

app.use((err:any, req:express.Request, res:express.Response, next: express.NextFunction)=>{
    console.error(err)
    res.status(500).json({
        success:false, 
        error: 'Internal Server Error'
    })
})

app.use('api/leaderboard', leaderboardRoutes)

app.listen(PORT , ()=>{
    console.log(`server is running on http://localhost:${PORT}`)
})