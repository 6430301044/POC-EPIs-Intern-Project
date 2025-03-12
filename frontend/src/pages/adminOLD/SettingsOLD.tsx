import { useEffect, useState } from 'react'

interface UserProfile {
  name: string
  email: string
  avatar: string
  role: string
  bio: string
  language: string
  timezone: string
}

interface NotificationSetting {
  email: boolean
  push: boolean
  monthly_report: boolean
  news_updates: boolean
}

export default function Settings() {
    useEffect(() => {
        document.title = "Settings | WindReact"
    }, [])

    const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security'>('profile')
    const [profile, setProfile] = useState<UserProfile>({
        name: 'สมชาย ใจดี',
        email: 'somchai@windreact.com',
        avatar: '/images/avatars/avt1.jpg',
        role: 'Frontend Developer',
        bio: 'Full-stack developer with 5 years of experience',
        language: 'th',
        timezone: 'Asia/Bangkok'
    })

    const [notifications, setNotifications] = useState<NotificationSetting>({
        email: true,
        push: true,
        monthly_report: false,
        news_updates: true
    })

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setProfile(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleNotificationChange = (key: keyof NotificationSetting) => {
        setNotifications(prev => ({
            ...prev,
            [key]: !prev[key]
        }))
    }

    return (
        <div className="container mx-auto px-4">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Settings
            </h1>

            {/* Tabs */}
            <div className="mt-6 border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8">
                    {(['profile', 'notifications', 'security'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm ${
                                activeTab === tab
                                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <div className="mt-6">
                {activeTab === 'profile' && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                        <div className="p-6 space-y-6">
                            {/* Avatar Section */}
                            <div className="flex items-center space-x-4">
                                <img
                                    src={profile.avatar}
                                    alt=""
                                    className="w-16 h-16 rounded-full"
                                />
                                <div>
                                    <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">
                                        Change Avatar
                                    </button>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        PNG, JPG up to 10MB
                                    </p>
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={profile.name}
                                        onChange={handleProfileChange}
                                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={profile.email}
                                        onChange={handleProfileChange}
                                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Role
                                    </label>
                                    <input
                                        type="text"
                                        name="role"
                                        value={profile.role}
                                        onChange={handleProfileChange}
                                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Language
                                    </label>
                                    <select
                                        name="language"
                                        value={profile.language}
                                        onChange={handleProfileChange}
                                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    >
                                        <option value="th">Thai</option>
                                        <option value="en">English</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Bio
                                    </label>
                                    <textarea
                                        name="bio"
                                        value={profile.bio}
                                        onChange={handleProfileChange}
                                        rows={3}
                                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                        <div className="p-6 space-y-6">
                            <div className="space-y-4">
                                {Object.entries(notifications).map(([key, value]) => (
                                    <div key={key} className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                                {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Receive notifications for {key.split('_').join(' ')}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleNotificationChange(key as keyof NotificationSetting)}
                                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                                value ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                                            }`}
                                        >
                                            <span
                                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                    value ? 'translate-x-5' : 'translate-x-0'
                                                }`}
                                            />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                        <div className="p-6 space-y-6">
                            {/* Change Password */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Change Password
                                </h3>
                                <div className="mt-4 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Current Password
                                        </label>
                                        <input
                                            type="password"
                                            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                        Update Password
                                    </button>
                                </div>
                            </div>

                            {/* Two Factor Authentication */}
                            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                            Two-Factor Authentication
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Add additional security to your account
                                        </p>
                                    </div>
                                    <button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">
                                        Enable 2FA
                                    </button>
                                </div>
                            </div>

                            {/* Session Management */}
                            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                            Active Sessions
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Manage your active sessions
                                        </p>
                                    </div>
                                    <button className="px-4 py-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                                        Sign out all devices
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
} 