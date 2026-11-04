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

export function getAllTags(): string[] {
  const all = new Set<string>()
  Object.values(postTags).forEach((ts) => ts.forEach((t) => all.add(t)))
  Object.values(experienceTags).forEach((ts) => ts.forEach((t) => all.add(t)))
  return [...all].sort()
}
