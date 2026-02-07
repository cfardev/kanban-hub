import { defineApp } from "convex/server";
import presence from "@convex-dev/presence/convex.config.js";
import betterAuth from "./better-auth/convex.config";

const app = defineApp();
app.use(betterAuth);
app.use(presence);

export default app;
