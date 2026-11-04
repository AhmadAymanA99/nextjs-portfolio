export async function GET() {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env

  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
    return Response.json({ isPlaying: false })
  }

  try {
    const basic = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')

    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basic}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: SPOTIFY_REFRESH_TOKEN,
      }),
    })

    if (!tokenRes.ok) {
      const text = await tokenRes.text()
      console.error('Spotify token refresh failed:', tokenRes.status, text)
      return Response.json({ isPlaying: false })
    }

    const { access_token } = await tokenRes.json()

    const recentRes = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', {
      headers: { Authorization: `Bearer ${access_token}` },
    })

    if (!recentRes.ok) {
      return Response.json({ isPlaying: false })
    }

    const data = await recentRes.json()

    if (!data?.items?.[0]?.track) {
      return Response.json({ isPlaying: false })
    }

    const track = data.items[0].track

    return Response.json({
      isPlaying: true,
      title: track.name,
      artist: track.artists.map((a) => a.name).join(', '),
      album: track.album.name,
      albumImage: track.album.images?.[0]?.url || null,
      songUrl: track.external_urls?.spotify || null,
    })
  } catch (err) {
    console.error('Spotify API error:', err)
    return Response.json({ isPlaying: false })
  }
}
