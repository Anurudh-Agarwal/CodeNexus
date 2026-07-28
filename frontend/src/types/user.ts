/**
 * Represents a student account in CodeNexus.
 */
interface User {

  id: string
  email: string     // IET Lucknow email address
  name: string                                  

  year: 1 | 2 | 3 | 4                         
  branch: "CSE-R" | "CSE-AI" | "CSE-SF" | "ECE" | "EE" | "ME" | "CE" | "CHE"

  avatar_url?: string                         
  bio?: string                                
  github_url?: string                           
  linkedin_url?: string                         

  profile_views: number                       

  account_verified: boolean                    
  account_banned: boolean                       

  created_at: string    
  updated_at: string                           
}

export default User