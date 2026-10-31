// Public browser settings that live in Supabase secrets instead of a .env file.
// The Google Maps key is a BROWSER key: restrict it by HTTP referrer and by API in Google Cloud Console.
// Never add real secrets to this response. Secrets: GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_MAP_ID (optional).

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

Deno.serve((req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  return new Response(
    JSON.stringify({
      googleMaps: {
        apiKey: Deno.env.get('GOOGLE_MAPS_API_KEY') ?? '',
        mapId: Deno.env.get('GOOGLE_MAPS_MAP_ID') ?? '',
      },
    }),
    { headers: { ...CORS, 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=300' } },
  );
});
