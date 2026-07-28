// ═══════════════════════════════════════════════════════════════
// Felix Lens — Edge Function: fetch-serpapi-place
// Enriches a place record with data from SerpAPI Google Maps
//
// Deploy: supabase functions deploy fetch-serpapi-place
// POST /functions/v1/fetch-serpapi-place
// Body: { place_id: string, place_name: string, lat?: number, lng?: number }
// ═══════════════════════════════════════════════════════════════

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SERPAPI_KEY  = Deno.env.get("SERPAPI_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface RequestBody {
  place_id:   string;
  place_name: string;
  lat?:       number;
  lng?:       number;
}

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin":  "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    const body: RequestBody = await req.json();
    const { place_id, place_name, lat, lng } = body;

    if (!place_id || !place_name) {
      return json({ error: "place_id and place_name are required" }, 400);
    }

    // Build SerpAPI URL
    let serpUrl = `https://serpapi.com/search?engine=google_maps`
      + `&q=${encodeURIComponent(place_name + " Yemen")}`
      + `&api_key=${SERPAPI_KEY}`;

    if (lat && lng) {
      serpUrl += `&ll=@${lat},${lng},12z`;
    }

    const resp = await fetch(serpUrl);
    if (!resp.ok) {
      throw new Error(`SerpAPI error: ${resp.status} ${resp.statusText}`);
    }

    const serpData = await resp.json();
    const result   = serpData.local_results?.[0] ?? serpData.place_results ?? null;

    if (!result) {
      return json({ error: "No results found for this place", serpData }, 404);
    }

    // Extract enrichment data
    const enrichment = {
      serpapi_place_id:   result.place_id ?? null,
      google_maps_url:    result.links?.google_maps ?? result.link ?? null,
      google_rating:      result.rating ?? null,
      google_photo_url:   result.thumbnail ?? result.photos?.[0]?.thumbnail ?? null,
      serpapi_data:       serpData,
      serpapi_fetched_at: new Date().toISOString(),
      // Update coordinates if more precise ones are available
      ...(result.gps_coordinates
        ? {
            lat: result.gps_coordinates.latitude,
            lng: result.gps_coordinates.longitude,
          }
        : {}),
    };

    // Persist to Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const { error } = await supabase
      .from("places")
      .update(enrichment)
      .eq("id", place_id);

    if (error) throw error;

    return json({
      success: true,
      place_id,
      enrichment: {
        serpapi_place_id:   enrichment.serpapi_place_id,
        google_maps_url:    enrichment.google_maps_url,
        google_rating:      enrichment.google_rating,
        google_photo_url:   enrichment.google_photo_url,
        serpapi_fetched_at: enrichment.serpapi_fetched_at,
      },
    });
  } catch (err) {
    console.error("[fetch-serpapi-place]", err);
    return json({ error: String(err) }, 500);
  }
});

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type":                 "application/json",
      "Access-Control-Allow-Origin":  "*",
    },
  });
}
