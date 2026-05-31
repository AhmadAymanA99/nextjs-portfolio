export const postTags = {
  'awafi-clinic': ['Next.js', 'React', 'Healthcare', 'SaaS', 'RTL'],
  'awn-app': ['Next.js', 'React', 'Mobile', 'SaaS'],
  'AlFagala': ['Next.js', 'Dashboard', 'Data Visualization', 'SaaS'],
  'covid-dashboard': ['Next.js', 'React', 'Data Visualization', 'Dashboard', 'SaaS'],
  'kptc': ['.NET', 'Enterprise', 'Dashboard', 'SaaS'],
  'portfolio-website': ['Next.js', 'Portfolio', 'Full-Stack'],
  'procoor-fm': ['Next.js', 'React', 'Enterprise', 'Facility Management', 'SaaS'],
  'procoor-pm': ['Next.js', 'React', 'Project Management', 'SaaS'],
  'sakenah-academy': ['Next.js', 'React', 'E-Learning', 'Healthcare', 'SaaS'],
  'trygrip': ['Next.js', 'React', 'E-Commerce', 'SaaS'],
  'would-you-rather': ['Next.js', 'React', 'Game', 'Interactive'],
}

export const experienceTags = {
  'Softera': ['React', 'Next.js', 'Healthcare', 'E-Learning', 'SaaS'],
  'Vidills': ['React', 'Enterprise'],
  'Procoor': ['.NET', 'React', 'Facility Management', 'Enterprise'],
  'MilitaryRecords': ['.NET', 'Government', 'Legacy'],
}

export function getAllTags() {
  const all = new Set()
  Object.values(postTags).forEach(ts => ts.forEach(t => all.add(t)))
  Object.values(experienceTags).forEach(ts => ts.forEach(t => all.add(t)))
  return [...all].sort()
}
