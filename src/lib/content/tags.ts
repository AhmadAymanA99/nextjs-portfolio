export const postTags = {
  rehlte: ['React Native', 'Expo', 'Mobile', 'Travel', 'RTL'],
  'awafi-clinic': ['Next.js', 'React', 'Healthcare', 'SaaS', 'RTL'],
  'awn-app': ['Next.js', 'React', 'Mobile', 'SaaS'],
  AlFagala: ['Next.js', 'React', 'E-Commerce', 'SEO'],
  'covid-dashboard': ['Next.js', 'React', 'Data Visualization', 'Dashboard', 'SaaS'],
  kptc: ['.NET', 'Enterprise', 'Dashboard', 'SaaS'],
  'portfolio-website': ['Next.js', 'Portfolio', 'Full-Stack'],
  'procoor-fm': ['Next.js', 'React', 'Enterprise', 'Facility Management', 'SaaS'],
  'procoor-pm': ['Next.js', 'React', 'Project Management', 'SaaS'],
  'sakenah-academy': ['Next.js', 'React', 'E-Learning', 'Healthcare', 'SaaS'],
  trygrip: ['Next.js', 'React', 'E-Commerce', 'SaaS'],
  'would-you-rather': ['Next.js', 'React', 'Game', 'Interactive'],
}

export const experienceTags = {
  BisanTravel: ['React Native', 'Expo', 'Mobile', 'Travel', 'RTL'],
  Softera: ['React', 'Next.js', 'Healthcare', 'E-Learning', 'RTL'],
  Vidills: ['React', 'Redux', 'GraphQL', 'Enterprise'],
  Procoor: ['.NET', 'React', 'Facility Management', 'Enterprise'],
  MilitaryRecords: ['.NET', 'Government'],
}

/**
 * Tags for the project filter: only tags shared by at least two projects, so
 * every filter narrows the list without ever being empty.
 */
export function getAllTags(): string[] {
  const counts = new Map<string, number>()
  Object.values(postTags).forEach((ts) =>
    ts.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)),
  )
  return [...counts]
    .filter(([tag, n]) => n >= 2 && tag !== 'SaaS')
    .map(([tag]) => tag)
    .sort()
}
