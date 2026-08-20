import { supabase } from "../lib/supabase";

interface SignUpData {
  email: string;
  password: string;
  name: string;
  branch?: string;
  year?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface VerifyOtpData {
  email: string;
  token: string;
  name: string;
  year?: string;
  branch?: string;
}

export async function registerUser(data: SignUpData) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  });

  if (authError) throw authError;

  return {
    email: data.email,
    message: "OTP sent to email",
  };
}

export async function verifyOtpAndCreateProfile(data: VerifyOtpData) {
  console.log("data:", data);
  const { data: authData, error: otpError } = await supabase.auth.verifyOtp({
    email: data.email,
    token: data.token,
    type: "signup",
  });

  if (otpError) {
    console.log("there is an error bro", otpError);
    throw otpError;
  }

  const userId = authData.user?.id;

  const { error: profileError } = await supabase.from("users").insert({
    id: userId,
    email: data.email,
    name: data.name,
    year: data.year,
    branch: data.branch,
  });

  if (profileError) throw profileError;
  console.log(authData.session?.access_token);
  return {
    user: {
      id: userId,
      email: data.email,
      name: data.name,
    },
    token: authData.session?.access_token,
  };
}

export async function loginUser(data: LoginData) {
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

  if (authError) throw authError;

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select()
    .eq("id", authData.user?.id)
    .single();

  if (profileError) throw profileError;

  return {
    user: profile,
    token: authData.session.access_token,
  };
}
