export const postTags = {
  'awafi-clinic': ['React', 'Next.js', 'Healthcare', 'RTL'],
  'awn-app': ['React', 'Mobile', 'FinTech'],
  'AlFagala': ['React', 'Dashboard', 'Data Visualization'],
  'covid-dashboard': ['React', 'Data Visualization', 'Dashboard'],
  'kptc': ['.NET', 'Enterprise', 'Dashboard'],
  'portfolio-website': ['Next.js', 'Portfolio', 'Full-Stack'],
  'procoor-fm': ['React', 'Enterprise', 'Facility Management'],
  'procoor-pm': ['React', 'Project Management', 'SaaS'],
  'sakenah-academy': ['React', 'E-Learning', 'Healthcare'],
  'trygrip': ['React', 'E-Commerce', 'Startup'],
  'would-you-rather': ['React', 'Game', 'Interactive'],
}

export const experienceTags = {
  'Softera': ['React', 'Next.js', 'Healthcare', 'E-Learning'],
  'Vidills': ['React', '.NET', 'Enterprise'],
  'Procoor': ['React', 'Facility Management', 'Enterprise'],
  'MilitaryRecords': ['.NET', 'Government', 'Legacy'],
}

export function getAllTags() {
  const all = new Set()
  Object.values(postTags).forEach(ts => ts.forEach(t => all.add(t)))
  Object.values(experienceTags).forEach(ts => ts.forEach(t => all.add(t)))
  return [...all].sort()
}
