import { codeforcesLimiter } from "../lib/rateLimiter";
const CF_BASE='https://codeforces.com/api'

interface CodeforcesApiResponse<T> {
  status: 'OK' | 'FAILED'
  comment?: string
  result?: T
}

interface CodeforcesUserInfo {
  handle: string
  firstName?: string
  rating?: number
  rank?: string
}

interface CodeforcesSubmission {
  verdict?: string
  creationTimeSeconds: number
  problem: { contestId?: number; index: string; name: string }
}


export async function getCodeforcesUserInfo(handle:string):Promise<CodeforcesUserInfo>{
    return codeforcesLimiter.run(async()=>{
        const res= await fetch(`${CF_BASE}/user.info?handles=${encodeURIComponent(handle)}`)
        const json= await res.json() as CodeforcesApiResponse<CodeforcesUserInfo[]>
        if(json.status !=='OK' || !json.result){
            throw Error(json.comment || 'codeforces handle not found')
        }
        return json.result[0]
    })
}

export async function fetchCodeforcesStats(handle: string){
    const userInfo=getCodeforcesUserInfo(handle)
    const submissions = await codeforcesLimiter.run(async()=>{
        const res= await fetch(`${CF_BASE}/user.status?handle=${encodeURIComponent(handle)}&from=1&count=100000`)
        const json = await res.json() as CodeforcesApiResponse<CodeforcesSubmission[]>
        if(json.status!=='OK' || !json.result){
            throw new Error(json.comment || 'Failed to fetch submissions')
        }
        return json.result
    })

    const firstAcceptedAt= new Map<string, number>()

    for(const sub of submissions){
        if(sub.verdict !== 'OK') continue;

        const key= sub.problem.contestId
        ? `${sub.problem.contestId}-${sub.problem.index}`
        : sub.problem.name

        const existing= firstAcceptedAt.get(key)
        if(existing === undefined || sub.creationTimeSeconds<existing){
            firstAcceptedAt.set(key, sub.creationTimeSeconds)
        }
    }

    const nowSeconds=Math.floor(Date.now()/1000)
    const THIRTY_DAYS= 30*24*60*60
    const YEAR= 365*24*60*60
    let monthly_solved=0
    let yearly_solved=0

    for(const acceptedAt of firstAcceptedAt.values()){
        const age= nowSeconds- acceptedAt
        if(age<=THIRTY_DAYS) monthly_solved++ 
        if(age<=YEAR) yearly_solved++
    }

    const {current_streak, longest_streak}=computeStreaks(
        submissions.map((sub) => sub.creationTimeSeconds)
    )

    return {
        rating: (await userInfo).rating ??null,
        rank: (await userInfo).rank??null,
        total_solved: firstAcceptedAt.size,
        monthly_solved,
        yearly_solved,
        current_streak,
        longest_streak,
    }
}

function computeStreaks(timestamps: number[]): { current_streak: number, longest_streak: number } {
    if (timestamps.length===0) return {current_streak:0, longest_streak:0}

    const SECONDS_PER_DAY=86400
    const INDIA_TIMEZONE_OFFSET_SECONDS=19800
    const dayNumbers= Array.from(
        new Set(timestamps.map((t)=>Math.floor((t + INDIA_TIMEZONE_OFFSET_SECONDS)/SECONDS_PER_DAY)))
    ).sort((a,b)=>a-b)

    let longest_streak=1
    let run=1
    for(let i=1; i<dayNumbers.length; i++){
        run=(dayNumbers[i]==dayNumbers[i-1]+1? run+1: 1)
        longest_streak=Math.max(longest_streak, run)
    }

    const todayDayNumber=Math.floor((Date.now()/1000 + INDIA_TIMEZONE_OFFSET_SECONDS)/SECONDS_PER_DAY)
    const lastActiveDay= dayNumbers[dayNumbers.length-1]

    if((todayDayNumber-lastActiveDay)>1){
        return {current_streak:0, longest_streak:longest_streak}
    }

    let current_streak=1;
    for(let i=dayNumbers.length-1; i>0; i--){
        if(dayNumbers[i]==dayNumbers[i-1]+1) current_streak++
        else break
    }

    return {current_streak,longest_streak}
}
