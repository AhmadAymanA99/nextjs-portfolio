import sql, { ensureDB } from '../../../lib/db';
import { verifyToken } from '../../../lib/auth';

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  if (!verifyToken(token)) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  try {
    await ensureDB();

    const days = parseInt(req.query.days) || null;
    const dateFilter = days
      ? sql`WHERE timestamp >= NOW() - INTERVAL '${days} days'`
      : sql``;

    const totalViewsResult =
      await sql`SELECT COUNT(*) as count FROM page_views ${dateFilter}`;
    const totalViews = parseInt(totalViewsResult[0]?.count || 0);

    const uniqueVisitorsResult =
      await sql`SELECT COUNT(DISTINCT ip_address) as count FROM page_views ${dateFilter}`;
    const uniqueVisitors = parseInt(uniqueVisitorsResult[0]?.count || 0);

    const topCountryResult =
      await sql`SELECT country, COUNT(*) as count FROM page_views ${dateFilter} GROUP BY country ORDER BY count DESC LIMIT 1`;
    const topCountry = topCountryResult[0]?.country || null;

    const deviceStatsResult =
      await sql`SELECT device_type, COUNT(*) as count FROM page_views ${dateFilter} GROUP BY device_type`;

    const deviceDistribution = {
      mobile: Math.round(
        ((deviceStatsResult.find((d) => d.device_type === 'mobile')?.count || 0) /
          totalViews) *
          100
      ),
      desktop: Math.round(
        ((deviceStatsResult.find((d) => d.device_type === 'desktop')?.count || 0) /
          totalViews) *
          100
      ),
    };

    const recentViewsResult =
      await sql`SELECT path, country, device_type, referrer, timestamp FROM page_views ${dateFilter} ORDER BY timestamp DESC LIMIT 50`;

    res.status(200).json({
      stats: {
        totalViews,
        uniqueVisitors,
        topCountry,
        deviceDistribution,
      },
      recentViews: recentViewsResult,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
