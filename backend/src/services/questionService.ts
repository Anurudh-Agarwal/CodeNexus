import { supabase } from "../lib/supabase";

const ALLOWED_DOMAINS= ['codeforces.com','codechef.com', 'geeksforgeeks.org', 'naukri.com', 'leetcode.com', 'atcoder.jp']

function isAllowedUrl(url: string):boolean{
    try{
        const {hostname}= new URL(url)
        return ALLOWED_DOMAINS.some((d)=> hostname===d|| hostname.endsWith(`${d}`))
    }catch{
        return false
    }
}

export async function searchQuestions(query : string){
    const {data, error} = await supabase.from('questions').select('*').ilike('title', `%${query}%`).limit(10)
    if (error) throw error
    return data
}

export async function findOrCreateQuestion(
    userId:string,
    {url, title , platform}: {url: string, title: string, platform: string}
){
    if(!isAllowedUrl(url)){
        throw new Error('Only links from Codeforces, Codechef, Leetcode, Geeksforgeeks, Codeninjas or Atcoder are allowed ')
    }
    const {data: existing , error: findError}= await supabase.from('questions').select('*').eq('url', url).maybeSingle()
    if(findError) throw findError
    if(existing) return existing

    const { data: created, error: insertError}= await supabase
        .from('questions')
        .insert({url, title,platform, added_by: userId})
        .select()
        .maybeSingle()

    if(insertError) throw insertError
    return created 
} 