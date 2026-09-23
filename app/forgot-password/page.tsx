import { pageMetadata } from "@/lib/seo";
import { ForgotPasswordPage } from "./form";

export const metadata = pageMetadata({
  title: "Forgot Password",
  description: "Request a secure password reset link for your Cognia Quest account.",
  path: "/forgot-password",
});

export default ForgotPasswordPage;
