import { execSync } from "child_process";

/** Seed once for the whole e2e run (parallel spec files share the server). */
export default function globalSetup() {
  execSync("npm run seed", { stdio: "inherit" });
}
