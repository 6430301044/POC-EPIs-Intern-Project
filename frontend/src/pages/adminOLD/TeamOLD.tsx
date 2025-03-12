import { useEffect, useState } from 'react'

interface TeamMember {
  id: string
  name: string
  role: string
  email: string
  avatar: string
  status: 'Active' | 'Offline' | 'In Meeting'
  department: string
  joinDate: string
}

export default function Team() {
  useEffect(() => {
    document.title = "Team | WindReact"
  }, [])

  const [searchQuery, setSearchQuery] = useState('')
  
  // ข้อมูลตัวอย่าง
  const teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'สมชาย ใจดี',
      role: 'Frontend Developer',
      email: 'somchai@windreact.com',
      avatar: '/images/avatars/avt1.jpg',
      status: 'Active',
      department: 'Engineering',
      joinDate: '2023-01-15'
    },
    {
      id: '2',
      name: 'สมหญิง รักเรียน',
      role: 'UX Designer',
      email: 'somying@windreact.com',
      avatar: '/images/avatars/avt2.png',
      status: 'In Meeting',
      department: 'Design',
      joinDate: '2023-03-20'
    },
    {
        id: '3',
        name: 'วิชาญ สมหญิง',
        role: 'UX Designer',
        email: 'somying@windreact.com',
        avatar: '/images/avatars/avt3.png',
        status: 'Offline',
        department: 'Design',
        joinDate: '2023-03-20'
    },
    {
        id: '4',
        name: 'สมหญิง สมชาย',
        role: 'UX Designer',
        email: 'somying@windreact.com',
        avatar: '/images/avatars/avt4.png',
        status: 'In Meeting',
        department: 'Design',
        joinDate: '2023-03-20'
    },
    {
        id: '5',
        name: 'วิชัย สมหาย',
        role: 'Frontend Developer',
        email: 'somchai@windreact.com',
        avatar: '/images/avatars/avt1.jpg',
        status: 'Active',
        department: 'Engineering',
        joinDate: '2023-01-15'
      },
      {
        id: '6',
        name: 'สมบัติ ลายแทง',
        role: 'UX Designer',
        email: 'somying@windreact.com',
        avatar: '/images/avatars/avt4.png',
        status: 'In Meeting',
        department: 'Design',
        joinDate: '2023-03-20'
      },
  ]

  const getStatusColor = (status: TeamMember['status']) => {
    switch (status) {
      case 'Active':
        return 'text-green-700 bg-green-100 dark:text-green-100 dark:bg-green-800'
      case 'Offline':
        return 'text-gray-700 bg-gray-100 dark:text-gray-100 dark:bg-gray-800'
      case 'In Meeting':
        return 'text-orange-700 bg-orange-100 dark:text-orange-100 dark:bg-orange-800'
    }
  }

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.department.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container mx-auto px-4">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Teams
        </h1>
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Add new team member"
        >
          <span className="flex items-center">
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Member
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
              placeholder="Search by name, role, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <SearchIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>
        </div>
        <button
          className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          aria-label="Filter team members"
        >
          <FilterIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Team Members Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <div key={member.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <img
                  className="h-12 w-12 rounded-full"
                  src={member.avatar}
                  alt={`${member.name}'s avatar`}
                />
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {member.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {member.role}
                  </p>
                </div>
              </div>
              <button
                className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                aria-label="More options"
              >
                <DotsIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <MailIcon className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-gray-700 dark:text-gray-300">{member.email}</span>
              </div>
              <div className="flex items-center text-sm">
                <BuildingIcon className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-gray-700 dark:text-gray-300">{member.department}</span>
              </div>
              <div className="flex items-center text-sm">
                <CalendarIcon className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-gray-700 dark:text-gray-300">
                  Joined {new Date(member.joinDate).toLocaleDateString()}
                </span>
              </div>
              <div className="pt-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                  {member.status}
                </span>
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

function FilterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
    </svg>
  )
}

function MailIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 20 20" fill="currentColor">
      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
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

function DotsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
    </svg>
  )
} 