export default async function handler(req, res) {
  const cv = `Ahmad Ayman - Software Engineer
================================

Contact
-------
- Location: Cairo, Egypt
- GitHub: github.com/ahmadayman

Summary
-------
Software Engineer with expertise in React, Next.js, and full-stack development.
Experience building scalable web applications for healthcare, e-learning, and
enterprise domains.

Experience
----------
Softera (2023 - Present)
  React/Next.js Developer
  - Built Awafi Clinic, a telemedicine platform for mental healthcare
  - Developed Sakenah Academy, an e-learning platform
  - Maintained TryGrip e-commerce marketplace

Vidills (2022 - 2023)
  Full-Stack Developer
  - Developed enterprise applications using React and .NET
  - Built data dashboards and reporting tools

Procoor Solutions (2021 - 2022)
  Frontend Developer
  - Built Procoor FM facility management application
  - Developed Procoor PM project management SaaS

Skills
------
- Frontend: React, Next.js, JavaScript, TypeScript, HTML/CSS
- Backend: .NET Core, Node.js, REST APIs
- Database: PostgreSQL, SQL Server
- Tools: Git, Docker, Azure, CI/CD, Agile/Scrum

Education
---------
Bachelor's degree in Computer Science
`

  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.setHeader('Content-Disposition', 'attachment; filename="Ahmad_Ayman_CV.txt"')
  res.status(200).send(cv)
}
