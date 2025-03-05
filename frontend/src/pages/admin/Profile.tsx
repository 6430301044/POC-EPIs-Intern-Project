import { useEffect } from 'react'

interface Skill {
  name: string
  level: number // 1-5
}

interface Experience {
  company: string
  position: string
  period: string
  description: string
}

export default function Profile() {
  useEffect(() => {
    document.title = "Profile | WindReact"
  }, [])

  const profile = {
    name: 'สมชาย ใจดี',
    role: 'Senior Frontend Developer',
    email: 'somchai@windreact.com',
    avatar: '/images/avatars/avt1.jpg',
    bio: 'Full-stack developer with 5 years of experience in web development. Passionate about creating user-friendly interfaces and solving complex problems.',
    location: 'Bangkok, Thailand',
    phone: '+66 81 234 5678',
    website: 'https://windreact.com',
    github: 'https://github.com/somchai',
    linkedin: 'https://linkedin.com/in/somchai'
  }

  const skills: Skill[] = [
    { name: 'React', level: 5 },
    { name: 'TypeScript', level: 4 },
    { name: 'Node.js', level: 4 },
    { name: 'Tailwind CSS', level: 5 },
    { name: 'Next.js', level: 4 },
    { name: 'GraphQL', level: 3 }
  ]

  const experience: Experience[] = [
    {
      company: 'WindReact',
      position: 'Senior Frontend Developer',
      period: '2022 - Present',
      description: 'Leading the frontend development team, implementing new features and improving application performance.'
    },
    {
      company: 'Tech Solutions',
      position: 'Frontend Developer',
      period: '2020 - 2022',
      description: 'Developed and maintained multiple React applications, collaborated with UX designers and backend developers.'
    },
    {
      company: 'Digital Agency',
      position: 'Junior Developer',
      period: '2018 - 2020',
      description: 'Started as a junior developer working on various web projects using React and Node.js.'
    }
  ]

  const renderSkillLevel = (level: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i <= level ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="relative h-32 bg-indigo-600">
          <img
            className="absolute bottom-0 left-6 -mb-6 w-24 h-24 rounded-full border-4 border-white dark:border-gray-800"
            src={profile.avatar}
            alt=""
          />
        </div>
        <div className="px-6 pt-10 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {profile.name}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{profile.role}</p>
            </div>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              Edit Profile
            </button>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">{profile.bio}</p>
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <LocationIcon className="w-5 h-5 mr-2" />
              {profile.location}
            </div>
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <EmailIcon className="w-5 h-5 mr-2" />
              {profile.email}
            </div>
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <PhoneIcon className="w-5 h-5 mr-2" />
              {profile.phone}
            </div>
          </div>
          <div className="mt-4 flex space-x-4">
            <a
              href={profile.github}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <GithubIcon className="w-6 h-6" />
            </a>
            <a
              href={profile.linkedin}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <LinkedInIcon className="w-6 h-6" />
            </a>
            <a
              href={profile.website}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <GlobeIcon className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>

      {/* Skills & Experience Grid */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skills Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Skills
          </h2>
          <div className="space-y-4">
            {skills.map((skill) => (
              <div key={skill.name} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {skill.name}
                </span>
                {renderSkillLevel(skill.level)}
              </div>
            ))}
          </div>
        </div>

        {/* Experience Section */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Experience
          </h2>
          <div className="space-y-6">
            {experience.map((exp, index) => (
              <div
                key={index}
                className="relative pl-8 pb-6 last:pb-0 border-l border-gray-200 dark:border-gray-700"
              >
                <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {exp.position}
                  </h3>
                  <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <BuildingIcon className="w-4 h-4 mr-1" />
                    {exp.company}
                    <span className="mx-2">•</span>
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    {exp.period}
                  </div>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">
                    {exp.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Icons Components
function LocationIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
  )
}

function EmailIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 20 20" fill="currentColor">
      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
    </svg>
  )
}

function PhoneIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 20 20" fill="currentColor">
      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
    </svg>
  )
}

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  )
}

function LinkedInIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
    </svg>
  )
}

function GlobeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
    </svg>
  )
}

function BuildingIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
    </svg>
  )
}

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
    </svg>
  )
}
