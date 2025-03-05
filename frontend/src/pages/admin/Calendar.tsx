import { useEffect, useState } from 'react'

interface Event {
  id: string
  title: string
  date: string
  time: string
  type: 'meeting' | 'task' | 'reminder'
  description: string
  participants?: {
    name: string
    avatar: string
  }[]
}

export default function Calendar() {
  useEffect(() => {
    document.title = "Calendar | WindReact"
  }, [])

  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  // ข้อมูลตัวอย่างกิจกรรม
  const events: Event[] = [
    {
      id: '1',
      title: 'Team Meeting',
      date: '2025-01-28',
      time: '10:00',
      type: 'meeting',
      description: 'Weekly team sync-up meeting',
      participants: [
        { name: 'สมชาย', avatar: '/images/avatars/avt1.jpg' },
        { name: 'สมหญิง', avatar: '/images/avatars/avt2.png' },
      ]
    },
    {
      id: '2',
      title: 'Project Deadline',
      date: '2025-01-28',
      time: '18:00',
      type: 'task',
      description: 'Complete the dashboard UI implementation'
    },
    {
      id: '3',
      title: 'Client Meeting',
      date: '2025-01-29',
      time: '14:30',
      type: 'meeting',
      description: 'Product demo with client',
      participants: [
        { name: 'วิชาญ', avatar: '/images/avatars/avt3.png' },
        { name: 'สมบัติ', avatar: '/images/avatars/avt4.png' },
      ]
    },
    {
      id: '4',
      title: 'Marketing Meeting',
      date: '2025-02-03',
      time: '09:00',
      type: 'meeting',
      description: 'Weekly marketing meeting',
      participants: [
        { name: 'สมชาย', avatar: '/images/avatars/avt1.jpg' },
        { name: 'สมหญิง', avatar: '/images/avatars/avt2.png' },
      ]
    },
    {
      id: '5',
      title: 'Project Testing',
      date: '2025-02-03',
      time: '08:00',
      type: 'task',
      description: 'Testing the new dashboard'
    },
    {
      id: '6',
      title: 'Project Go Live',
      date: '2025-02-04',
      time: '08:00',
      type: 'task',
      description: 'Live the project to the public'
    },
  ]

  const getEventTypeColor = (type: Event['type']) => {
    switch (type) {
      case 'meeting':
        return 'text-blue-700 bg-blue-100 dark:text-blue-100 dark:bg-blue-800'
      case 'task':
        return 'text-green-700 bg-green-100 dark:text-green-100 dark:bg-green-800'
      case 'reminder':
        return 'text-orange-700 bg-orange-100 dark:text-orange-100 dark:bg-orange-800'
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDayOfMonth = new Date(year, month, 1).getDay()
    
    const days = []
    // Add empty days for padding
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null)
    }
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    return days
  }

  const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  const getEventsForDate = (date: Date) => {
    return events.filter(event => event.date === formatDate(date))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDate(today)
  }

  return (
    <div className="container mx-auto px-4">
      {/* Header - ปรับให้จัดชิดซ้าย-ขวาเสมอ */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Calendar
        </h1>
        <button
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Add new event"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          <span className="whitespace-nowrap">New Event</span>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4">
          {/* Calendar Header - ปรับให้จัดชิดซ้าย-ขวาเสมอ */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={goToToday}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Today
              </button>
              <div className="flex space-x-2">
                <button
                  onClick={prevMonth}
                  className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  <ChevronRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Days of Week Header - ซ่อนบน mobile */}
          <div className="hidden sm:grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Mobile Days of Week - แสดงเฉพาะ mobile */}
          <div className="grid grid-cols-7 gap-1 mb-2 sm:hidden">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth(currentDate).map((date, index) => (
              <div
                key={index}
                className={`min-h-[60px] sm:min-h-[100px] p-1 sm:p-2 border border-gray-200 dark:border-gray-700 ${
                  date
                    ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700'
                    : 'bg-gray-50 dark:bg-gray-800'
                } ${
                  date && formatDate(date) === formatDate(selectedDate)
                    ? 'bg-indigo-50 dark:bg-indigo-900'
                    : ''
                }`}
                onClick={() => date && setSelectedDate(date)}
              >
                {date && (
                  <>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {date.getDate()}
                    </div>
                    <div className="mt-1 space-y-1">
                      {getEventsForDate(date).map((event) => (
                        <div
                          key={event.id}
                          className={`text-xs px-1 py-0.5 rounded truncate ${getEventTypeColor(
                            event.type
                          )}`}
                        >
                          <span className="hidden sm:inline">{event.time} </span>
                          {event.title}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Events List - ปรับ responsive */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Events for {selectedDate.toLocaleDateString()}
          </h3>
          <div className="space-y-4">
            {getEventsForDate(selectedDate).map((event) => (
              <div
                key={event.id}
                className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      {event.title}
                    </h4>
                    <span
                      className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${getEventTypeColor(
                        event.type
                      )}`}
                    >
                      {event.type}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {event.description}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      <ClockIcon className="w-4 h-4 inline mr-1" />
                      {event.time}
                    </span>
                    {event.participants && (
                      <div className="flex -space-x-2">
                        {event.participants.map((participant, index) => (
                          <img
                            key={index}
                            className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-800"
                            src={participant.avatar}
                            alt={participant.name}
                            title={participant.name}
                          />
                        ))}
                      </div>
                    )}
                  </div>
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
function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
    </svg>
  )
}

function ChevronLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  )
}

function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
  )
}

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
    </svg>
  )
} 