import { supabase } from "../lib/supabase";
import {
  registerUser,
  loginUser,
  verifyOtpAndCreateProfile,
} from "../services/authService";
import { Request, Response } from "express";
import { clearSessionCookie, setSessionCookie } from "../middleware/auth";

export async function signUp(req: Request, res: Response) {
  try {
    const { name, password, email, year, branch } = req.body;

    if (!email.endsWith("@ietlucknow.ac.in")) {
      return res.status(400).json({
        success: false,
        error: "Only @ietlucknow.ac.in emails allowed",
      });
    }

    if (!name || !password || !email) {
      return res.status(400).json({
        success: false,
        error: "Name, email, password are required",
      });
    }

    const result = await registerUser({ email, name, password, year, branch });

    console.log(result);

    res.status(201).json({
      success: true,
      data: {
        email,
        name,
        year,
        branch,
        message: result.message,
      },
    });
  } catch (err: any) {
    console.log("SignUp error:", err);
    res.status(500).json({
      success: false,
      error: err.message || "SignUp failed",
    });
  }
}

export async function verifyOtp(req: Request, res: Response) {
  try {
    const { email, token, name, year, branch } = req.body;

    if (!email || !token || !name || !year || !branch) {
      return res.status(400).json({
        success: false,
        error: "Email, OTP, name, year, and branch are required",
      });
    }

    const result = await verifyOtpAndCreateProfile({
      email,
      token,
      name,
      year,
      branch,
    });

    if (result.token) setSessionCookie(res, result.token);

    res.status(200).json({
      success: true,
      data: {
        user: result.user,
      },
    });
  } catch (err: any) {
    console.log("OTP verify error:", err);
    res.status(500).json({
      success: false,
      error: err.message || "OTP verification failed",
    });
  }
}

export async function logIn(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and Password required",
      });
    }

    const result = await loginUser({ email, password });
    setSessionCookie(res, result.token);

    res.status(200).json({
      success: true,
      data: {
        user: result.user,
      },
    });
  } catch (err: any) {
    console.log("SignUp error:", err);

    if (err.code === "23505") {
      return res.status(400).json({
        success: false,
        error: "Email already registered. Please login instead.",
      });
    }

    if (err.code === "email_exists") {
      return res.status(400).json({
        success: false,
        error: "Email already registered. Please login instead.",
      });
    }

    res.status(500).json({
      success: false,
      error: err.message || "SignUp failed",
    });
  }
}

export function logOut(_req: Request, res: Response) {
  clearSessionCookie(res);
  res.status(204).send();
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: "Email required" });
    }

    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) throw error;

    res.status(200).json({ success: true, message: "OTP sent to email" });
  } catch (err: any) {
    console.log("Forgot password error:", err);
    res
      .status(500)
      .json({ success: false, error: err.message || "Failed to send OTP" });
  }
}
