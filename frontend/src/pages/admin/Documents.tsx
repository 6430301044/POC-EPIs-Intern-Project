import { useEffect, useState } from 'react'

interface Document {
  id: string
  name: string
  type: 'pdf' | 'doc' | 'image' | 'spreadsheet'
  size: string
  lastModified: string
  owner: {
    name: string
    avatar: string
  }
  shared: boolean
}

export default function Documents() {
  useEffect(() => {
    document.title = "Documents | WindReact"
  }, [])

  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<Document['type'] | 'all'>('all')
  const [view, setView] = useState<'grid' | 'list'>('grid')

  const documents: Document[] = [
    {
      id: '1',
      name: 'Project Requirements.pdf',
      type: 'pdf',
      size: '2.4 MB',
      lastModified: '2024-03-15',
      owner: {
        name: 'สมชาย',
        avatar: '/images/avatars/avt1.jpg'
      },
      shared: true
    },
    {
      id: '2',
      name: 'Financial Report Q1.doc',
      type: 'doc',
      size: '1.8 MB',
      lastModified: '2024-03-14',
      owner: {
        name: 'สมหญิง',
        avatar: '/images/avatars/avt2.png'
      },
      shared: false
    },
    {
      id: '3',
      name: 'Design Assets.image',
      type: 'image',
      size: '4.2 MB',
      lastModified: '2024-03-13',
      owner: {
        name: 'วิชาญ',
        avatar: '/images/avatars/avt3.png'
      },
      shared: true
    },
    {
      id: '4',
      name: 'Sales Data.spreadsheet',
      type: 'spreadsheet',
      size: '1.1 MB',
      lastModified: '2024-03-12',
      owner: {
        name: 'สมบัติ',
        avatar: '/images/avatars/avt4.png'
      },
      shared: false
    },
    {
        id: '5',
        name: 'Sales Data.spreadsheet',
        type: 'spreadsheet',
        size: '1.1 MB',
        lastModified: '2024-03-12',
        owner: {
          name: 'สมบัติ',
          avatar: '/images/avatars/avt4.png'
        },
        shared: false
    },
    {
        id: '6',
        name: 'Design Assets.image',
        type: 'image',
        size: '4.2 MB',
        lastModified: '2024-03-13',
        owner: {
          name: 'วิชาญ',
          avatar: '/images/avatars/avt3.png'
        },
        shared: true
    },
    {
        id: '7',
        name: 'Financial Report Q1.doc',
        type: 'doc',
        size: '1.8 MB',
        lastModified: '2024-03-14',
        owner: {
          name: 'สมหญิง',
          avatar: '/images/avatars/avt2.png'
        },
        shared: false
    },
    {
        id: '8',
        name: 'Project Requirements.pdf',
        type: 'pdf',
        size: '2.4 MB',
        lastModified: '2024-03-15',
        owner: {
          name: 'สมชาย',
          avatar: '/images/avatars/avt1.jpg'
        },
        shared: true
    },
    
  ]

  const getFileIcon = (type: Document['type']) => {
    switch (type) {
      case 'pdf':
        return <PDFIcon className="w-8 h-8 text-red-500" />
      case 'doc':
        return <DocIcon className="w-8 h-8 text-blue-500" />
      case 'image':
        return <ImageIcon className="w-8 h-8 text-green-500" />
      case 'spreadsheet':
        return <SpreadsheetIcon className="w-8 h-8 text-emerald-500" />
    }
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === 'all' || doc.type === typeFilter
    return matchesSearch && matchesType
  })

  return (
    <div className="container mx-auto px-4">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Documents
        </h1>
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Upload new document"
        >
          <span className="flex items-center">
            <UploadIcon className="w-5 h-5 mr-2" />
            Upload
          </span>
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="mt-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border rounded-lg text-gray-700 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:border-indigo-500"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <SearchIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>
        </div>
        <select
          className="px-4 py-2 border rounded-lg text-gray-700 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:border-indigo-500"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as Document['type'] | 'all')}
        >
          <option value="all">All Types</option>
          <option value="pdf">PDF</option>
          <option value="doc">Document</option>
          <option value="image">Image</option>
          <option value="spreadsheet">Spreadsheet</option>
        </select>
        <div className="flex rounded-lg border border-gray-300 dark:border-gray-600">
          <button
            className={`p-2 ${
              view === 'grid'
                ? 'bg-gray-100 dark:bg-gray-700'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            onClick={() => setView('grid')}
            aria-label="Grid view"
          >
            <GridIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <button
            className={`p-2 ${
              view === 'list'
                ? 'bg-gray-100 dark:bg-gray-700'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            onClick={() => setView('list')}
            aria-label="List view"
          >
            <ListIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Documents Grid/List */}
      {view === 'grid' ? (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDocuments.map((doc) => (
            <div key={doc.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                {getFileIcon(doc.type)}
                <button
                  className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                  aria-label="More options"
                >
                  <DotsIcon className="w-5 h-5" />
                </button>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {doc.name}
              </h3>
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>{doc.size}</span>
                <span>{new Date(doc.lastModified).toLocaleDateString()}</span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    className="w-6 h-6 rounded-full"
                    src={doc.owner.avatar}
                    alt={doc.owner.name}
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {doc.owner.name}
                  </span>
                </div>
                {doc.shared && (
                  <ShareIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Last Modified
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {getFileIcon(doc.type)}
                        <span className="ml-2 text-sm text-gray-900 dark:text-white">
                          {doc.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          className="w-6 h-6 rounded-full"
                          src={doc.owner.avatar}
                          alt={doc.owner.name}
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          {doc.owner.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(doc.lastModified).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {doc.size}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                        aria-label="More options"
                      >
                        <DotsIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// Icons Components
function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
    </svg>
  )
}

function UploadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
  )
}

function GridIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 20 20" fill="currentColor">
      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  )
}

function ListIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
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

function ShareIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 20 20" fill="currentColor">
      <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
    </svg>
  )
}

function PDFIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
    </svg>
  )
}

function DocIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 3a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
  )
}

function ImageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
    </svg>
  )
}

function SpreadsheetIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
    </svg>
  )
} 