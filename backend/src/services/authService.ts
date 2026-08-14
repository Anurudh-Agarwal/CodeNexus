import { supabase } from "../lib/supabase"
interface SignUpData {
    email: string,
    password: string,
    name: string,
    branch?: string,
    year?:string
}
interface LoginData {
    email: string,
    password: string,
}
export async function registerUser(data:SignUpData){
    
    const {data : authData, error: authError}= await supabase.auth.signUp({
        email: data.email,
        password: data.password,
    })

    if(authError) throw authError

    const userId=authData.user?.id

    const {error: profileError}= await supabase
        .from('users')
        .insert({
            id: userId,
            email: data.email,
            name: data.name,
            year: data.year,
            branch: data.branch,
        })
    if(profileError) throw profileError

    return {
        user:{
            id: userId,
            email: data.email,
            name: data.name
        },
        token: authData.session?.access_token
    }
}

export async function loginUser(data:LoginData){

    const {data: authData, error: authError}= await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
    })

    if(authError) throw authError
    
    const profile = await supabase
        .from('users')
        .select()
        .eq('id', authData.user?.id)
        .single()
    
    return {
        user: profile,
        token: authData.session.access_token
    }
}