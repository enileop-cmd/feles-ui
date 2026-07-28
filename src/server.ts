type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

/**
 * Collect a streaming Response into a buffered Response.
 * This is required for Netlify Functions which do not support streaming.
 */
async function bufferResponse(streamingRes: Response): Promise<Response> {
  const body = await streamingRes.arrayBuffer();
  return new Response(body, {
    status: streamingRes.status,
    statusText: streamingRes.statusText,
    headers: streamingRes.headers,
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const res = await handler.fetch(request, env, ctx);
      
      // Buffer the stream so Netlify Functions can handle it correctly
      // But skip buffering in development to prevent localhost from hanging
      if (import.meta.env.DEV) {
        return res;
      }
      return await bufferResponse(res);
    } catch (error) {
      console.error(error);
      return new Response("Internal Server Error", {
        status: 500,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }
  },
};
