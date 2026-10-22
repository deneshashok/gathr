export const dynamic = 'force-dynamic';
export async function GET() {
  const key = process.env.CARTO_BASEMAP_KEY;
  return Response.json({
    provider: key ? 'CARTO Positron' : 'OpenStreetMap · greyscale',
    greyscale: !key,
    tileUrl: key
      ? 'https://basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}{r}.png?key=' + encodeURIComponent(key)
      : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: key
      ? '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, © <a href="https://carto.com/attribution/">CARTO</a>'
      : '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxNativeZoom: key ? 18 : 19,
  }, { headers: { 'Cache-Control': 'no-store' } });
}
