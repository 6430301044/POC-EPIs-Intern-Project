import { useEffect, useState } from 'react'

interface Project {
  id: string
  name: string
  description: string
  status: 'In Progress' | 'Completed' | 'On Hold'
  progress: number
  dueDate: string
  team: {
    name: string
    avatar: string
  }[]
  tags: string[]
}

export default function Projects() {
  useEffect(() => {
    document.title = "Projects | WindReact"
  }, [])

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<Project['status'] | 'All'>('All')

  const projects: Project[] = [
    {
      id: '1',
      name: 'WindReact Dashboard',
      description: 'Admin dashboard template with Tailwind CSS and React',
      status: 'In Progress',
      progress: 75,
      dueDate: '2024-04-15',
      team: [
        { name: 'สมชาย', avatar: '/images/avatars/avt1.jpg' },
        { name: 'สมหญิง', avatar: '/images/avatars/avt2.png' },
        { name: 'วิชาญ', avatar: '/images/avatars/avt3.png' },
      ],
      tags: ['React', 'Tailwind', 'TypeScript']
    },
    {
      id: '2',
      name: 'E-commerce Platform',
      description: 'Online shopping platform with modern UI/UX',
      status: 'Completed',
      progress: 100,
      dueDate: '2024-03-01',
      team: [
        { name: 'สมบัติ', avatar: '/images/avatars/avt4.png' },
        { name: 'วิชัย', avatar: '/images/avatars/avt1.jpg' },
      ],
      tags: ['Next.js', 'MongoDB', 'Stripe']
    },
    {
      id: '3',
      name: 'Mobile App Development',
      description: 'Cross-platform mobile application',
      status: 'On Hold',
      progress: 30,
      dueDate: '2024-05-30',
      team: [
        { name: 'สมหญิง', avatar: '/images/avatars/avt2.png' },
        { name: 'วิชาญ', avatar: '/images/avatars/avt3.png' },
      ],
      tags: ['React Native', 'Firebase']
    },
    {
        id: '4',
        name: 'WindReact Dashboard',
        description: 'Admin dashboard template with Tailwind CSS and React',
        status: 'In Progress',
        progress: 75,
        dueDate: '2024-04-15',
        team: [
          { name: 'สมชาย', avatar: '/images/avatars/avt1.jpg' },
          { name: 'สมหญิง', avatar: '/images/avatars/avt2.png' },
          { name: 'วิชาญ', avatar: '/images/avatars/avt3.png' },
        ],
        tags: ['React', 'Tailwind', 'TypeScript']
    },
    {
        id: '5',
        name: 'E-commerce Platform',
        description: 'Online shopping platform with modern UI/UX',
        status: 'Completed',
        progress: 100,
        dueDate: '2024-03-01',
        team: [
          { name: 'สมบัติ', avatar: '/images/avatars/avt4.png' },
          { name: 'วิชัย', avatar: '/images/avatars/avt1.jpg' },
        ],
        tags: ['Next.js', 'MongoDB', 'Stripe']
    },
    {
        id: '6',
        name: 'Mobile App Development',
        description: 'Cross-platform mobile application',
        status: 'On Hold',
        progress: 30,
        dueDate: '2024-05-30',
        team: [
          { name: 'สมหญิง', avatar: '/images/avatars/avt2.png' },
          { name: 'วิชาญ', avatar: '/images/avatars/avt3.png' },
        ],
        tags: ['React Native', 'Firebase']
    },
  ]

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'In Progress':
        return 'text-blue-700 bg-blue-100 dark:text-blue-100 dark:bg-blue-800'
      case 'Completed':
        return 'text-green-700 bg-green-100 dark:text-green-100 dark:bg-green-800'
      case 'On Hold':
        return 'text-orange-700 bg-orange-100 dark:text-orange-100 dark:bg-orange-800'
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesStatus = statusFilter === 'All' || project.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  return (
    <div className="container mx-auto px-4">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Projects
        </h1>
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Create new project"
        >
          <span className="flex items-center">
            <PlusIcon className="w-5 h-5 mr-2" />
            New Project
          </span>
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="mt-6 flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-gray-700 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:border-indigo-500"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <SearchIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>
        </div>
        <select
          className="px-4 py-2 border rounded-lg text-gray-700 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:border-indigo-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as Project['status'] | 'All')}
        >
          <option value="All">All Status</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="On Hold">On Hold</option>
        </select>
      </div>

      {/* Projects Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {project.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {project.description}
                  </p>
                </div>
                <button
                  className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                  aria-label="More options"
                >
                  <DotsIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Progress
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {project.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="mt-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {project.team.map((member, index) => (
                    <img
                      key={index}
                      className="w-7 h-7 rounded-full border-2 border-white dark:border-gray-800"
                      src={member.avatar}
                      alt={member.name}
                      title={member.name}
                    />
                  ))}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Due {new Date(project.dueDate).toLocaleDateString()}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {project.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Icons Components
function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
  )
}

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
    </svg>
  )
}

function DotsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
    </svg>
  )
} 