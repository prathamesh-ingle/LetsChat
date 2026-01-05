// src/lib/resend.js
import { Resend } from "resend";
import { ENV } from "./env.js";  // your own env helper that reads process.env

export const resendClient = new Resend(ENV.RESEND_API_KEY);

export const sender = {
  email: ENV.EMAIL_FROM,
  name: ENV.EMAIL_FROM_NAME,
};
