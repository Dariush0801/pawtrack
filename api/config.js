/**
 * Public browser configuration (served at /api/config).
 * Only values that are safe to ship to the browser belong here. The Google Maps key is a
 * browser key, so restrict it by HTTP referrer and by API in Google Cloud Console.
 * Never add secrets (service keys, SMTP keys, Gemini keys) to this response.
 */
function getPublicConfig() {
  return {
    googleMaps: {
      apiKey: process.env.GOOGLE_MAPS_API_KEY || '',
      mapId: process.env.GOOGLE_MAPS_MAP_ID || ''
    }
  };
}

function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json(getPublicConfig());
}

module.exports = handler;
module.exports.getPublicConfig = getPublicConfig;
