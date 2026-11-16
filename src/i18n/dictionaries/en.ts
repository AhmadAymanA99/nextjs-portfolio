import type { PluralForms } from '../config'

/** Interface text in English. `ar.ts` must provide every key (the type enforces it). */
const en = {
  meta: {
    siteName: 'Ahmad Ayman',
    title: 'Ahmad Ayman — Frontend & Mobile Engineer',
    description:
      'Frontend and mobile engineer with 6 years of experience building React, Next.js, React Native, and TypeScript apps for travel, healthcare, e-commerce, and government platforms across the MENA region.',
    titleSuffix: ' - Ahmad Ayman',
  },
  common: {
    name: 'Ahmad Ayman',
    skipToContent: 'Skip to main content',
    backHome: '← Back to home',
    backToTop: 'Back to top',
    switchLanguage: 'العربية',
    switchLanguageLabel: 'اقرأ الموقع بالعربية',
    now: 'now',
    present: 'Present',
    dateRange: '{start} to {end}',
    readingTime: { other: '{n} min read' } as PluralForms,
    views: { one: '{n} view', other: '{n} views' } as PluralForms,
    sending: 'Sending...',
  },
  home: {
    role: 'Frontend & Mobile Engineer',
    roleStack: '(React / React Native / Next.js)',
    bio: '6 years building React, Next.js, and React Native apps for travel, healthcare, e-commerce, and government platforms across the MENA region. Shipped bilingual Arabic/English RTL interfaces, a government service used by 3M+ people, and enterprise apps serving 600K+ users.',
    /** Followed by Cairo's UTC offset, e.g. "(GMT+2)" */
    availability: 'Open to remote roles & freelance · Cairo, Egypt',
    contactMe: 'Contact me',
    downloadCv: 'Download CV',
    latestExperience: 'Latest Experience',
    current: 'Current',
    viewDetails: 'View details',
    noExperience: 'No experience listed yet',
    skills: 'Skills',
    connect: 'Connect',
    lastPlayed: 'Last Played',
    recentActivity: 'Recent Activity',
    projects: 'Projects',
    allTags: 'All',
    noProjectsMatch: 'No projects match this filter.',
    experience: 'Experience',
  },
  /** Display names for project tags; tags without an entry are shown as-is */
  tags: {} as Record<string, string>,
  project: {
    overview: 'Project overview',
    role: 'Role',
    company: 'Company',
    platform: 'Platform',
    status: 'Status',
    techStack: 'Tech stack',
    visitLive: 'Visit live site',
    screenshots: 'Screenshots',
    viewScreenshot: 'View screenshot {n}',
    screenshotAlt: 'Screenshot {n} of {title}',
    imageViewer: 'Image viewer',
    close: 'Close',
    previousImage: 'Previous image',
    nextImage: 'Next image',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    toggleFullscreen: 'Toggle fullscreen',
    onThisPage: 'On this page',
    share: 'Share',
    shareLinkedIn: 'Share on LinkedIn',
    shareX: 'Share on X',
    copyLink: 'Copy link',
    related: 'Related Projects',
  },
  contact: {
    title: 'Get in Touch',
    thanks: "Thanks for reaching out! I'll get back to you soon.",
    sendAnother: 'Send another message',
    name: 'Your name',
    email: 'Your email',
    subject: 'Subject (optional)',
    subjectLabel: 'Subject',
    message: 'Your message',
    send: 'Send Message',
    completeCheck: 'Please complete the security check',
    genericError: 'Something went wrong',
    networkError: 'Network error',
  },
  guestbook: {
    metaTitle: 'Guestbook',
    metaDescription: 'Leave a message for Ahmad Ayman.',
    title: 'Guestbook',
    subtitle: 'Leave a message. Say hello. Share your thoughts.',
    success: 'Thanks! Your message will appear after approval.',
    name: 'Your name *',
    nameLabel: 'Your name',
    website: 'Website (optional)',
    websiteLabel: 'Website',
    message: 'Your message *',
    messageLabel: 'Your message',
    submitting: 'Submitting...',
    submit: 'Sign the Guestbook',
    required: 'Name and message are required',
    failed: 'Failed to submit',
    networkError: 'Network error. Please try again.',
    empty: 'No messages yet. Be the first!',
  },
  faq: {
    metaTitle: 'FAQ',
    metaDescription:
      "Frequently asked questions about Ahmad Ayman's work, availability, and process.",
    title: 'FAQ',
    subtitle: 'Frequently asked questions',
    items: [
      {
        q: 'What technologies do you work with?',
        a: 'I specialize in React, Next.js, React Native (Expo), and TypeScript for web and mobile apps, including bilingual Arabic/English RTL interfaces. I am also comfortable across the stack with Node.js, .NET Core, FastAPI, and PostgreSQL.',
      },
      {
        q: 'Are you available for freelance work?',
        a: "Yes, I'm open to freelance projects and collaborations. Feel free to reach out through the contact form or directly via email to discuss your project.",
      },
      {
        q: 'What is your development process?',
        a: 'I follow an agile approach: requirements gathering, architecture planning, iterative development with regular reviews, testing, and deployment. I prioritize clean code, performance, and user experience.',
      },
      {
        q: 'Do you offer ongoing maintenance?',
        a: 'Yes, I provide ongoing support and maintenance for projects I develop, including updates, bug fixes, and feature enhancements.',
      },
      {
        q: 'How can I hire you?',
        a: 'You can reach me via the contact form on this site, email me directly at ahmadaymana99@gmail.com, or connect with me on LinkedIn. I typically respond within 24 hours.',
      },
      {
        q: 'What is your preferred working style?',
        a: "I work best in a collaborative environment with clear communication. I'm comfortable with remote work and use tools like GitHub, Slack, and ClickUp for project management.",
      },
    ],
  },
  footer: {
    fullName: 'Ahmad Ayman Elsaeid',
    location: 'Cairo, Egypt',
    guestbook: 'Guestbook',
    faq: 'FAQ',
    objective:
      'Frontend and mobile engineer building React, Next.js, and React Native apps with bilingual Arabic/English RTL support. Focused on performance, SEO, and maintainable component architecture.',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    rights: 'All rights reserved. © {year}.',
  },
  notFound: {
    title: 'Page not found',
    text: "The page you're looking for doesn't exist or has been moved.",
    home: 'Go back home',
  },
}

export default en

/** Same shape as the English dictionary, with any string values. */
type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? Widen<U>[]
    : { [K in keyof T]: Widen<T[K]> }

export type Dictionary = Widen<typeof en>
