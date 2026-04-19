import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { auth } from "./auth";
import { api } from "./_generated/api";

const http = httpRouter();
auth.addHttpRoutes(http);

// Temporary seed endpoint
http.route({
  path: "/seed",
  method: "POST",
  handler: httpAction(async (ctx) => {
    await ctx.runMutation(api.agentTemplates.seed);
    return new Response("Seeded successfully", { status: 200 });
  }),
});

export default http;
