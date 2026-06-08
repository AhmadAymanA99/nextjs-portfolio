const GITHUB_USERNAME = 'AhmadAymanA99'

export default async function handler(req, res) {
  try {
    const token = process.env.GITHUB_TOKEN
    const headers = { Accept: 'application/vnd.github.v3+json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const eventsRes = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/events?per_page=10`,
      { headers },
    )

    if (!eventsRes.ok) {
      console.error('GitHub API error:', eventsRes.status, await eventsRes.text())
      return res.json({ activities: [] })
    }

    const events = await eventsRes.json()

    const activities = events
      .filter((e) => {
        if (
          !['PushEvent', 'CreateEvent', 'IssuesEvent', 'WatchEvent', 'ForkEvent'].includes(e.type)
        )
          return false
        if (e.type === 'PushEvent' && !e.payload.size && !e.payload.commits?.length) return false
        return true
      })
      .slice(0, 6)
      .map((e) => ({
        type: e.type,
        repo: e.repo.name,
        action: formatAction(e),
        createdAt: e.created_at,
      }))

    res.json({ activities })
  } catch (err) {
    console.error('GitHub API error:', err)
    res.json({ activities: [] })
  }
}

function formatAction(event) {
  switch (event.type) {
    case 'PushEvent': {
      const count = event.payload.size || event.payload.commits?.length || 1
      const branch = event.payload.ref?.replace('refs/heads/', '') || ''
      const msg = event.payload.commits?.[0]?.message?.split('\n')[0] || ''
      return `Pushed ${count} commit${count !== 1 ? 's' : ''}${branch ? ` to ${truncate(branch, 20)}` : ''}${msg ? ` — ${truncate(msg, 50)}` : ''}`
    }
    case 'CreateEvent':
      return `Created ${event.payload.ref_type}${event.payload.ref ? ` (${truncate(event.payload.ref, 25)})` : ''}`
    case 'IssuesEvent':
      return `${event.payload.action === 'opened' ? 'Opened' : event.payload.action === 'closed' ? 'Closed' : event.payload.action} issue`
    case 'WatchEvent':
      return 'Starred'
    case 'ForkEvent':
      return 'Forked'
    default:
      return event.type
  }
}

function truncate(str, max) {
  return str.length > max ? str.slice(0, max) + '…' : str
}
