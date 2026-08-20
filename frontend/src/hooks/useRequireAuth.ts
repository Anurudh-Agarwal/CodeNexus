import { useEffect } from "react";
import { useAuth } from "./useAuth";
import { useRouter } from "next/navigation";

export function useRequireAuth(){
    const route=useRouter();
    const {user, isLoading}=useAuth();
    useEffect(()=>{
        if(!isLoading && !user){
            route.push('/login')
        }
    },[user, isLoading, route])

return {user, isLoading};
}