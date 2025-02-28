import { useEffect } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip
} from "recharts"

interface StatCardProps {
  title: string
  value: string | number
  change: {
    type: "increase" | "decrease"
    value: string
    text: string
  }
  icon: React.ReactNode
}

function StatCard({ title, value, change, icon }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between">
        <div>
          <p className="text-sm text-gray-700 dark:text-gray-300 uppercase">
            {title}
          </p>
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
            {value}
          </h3>
          <div className="flex items-center mt-2">
            <span
              className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                change.type === "increase"
                  ? "text-green-700 bg-green-100 dark:text-green-100 dark:bg-green-800"
                  : "text-red-700 bg-red-100 dark:text-red-100 dark:bg-red-800"
              }`}
            >
              {change.type === "increase" ? "+" : "-"}
              {change.value}
            </span>
            <span className="text-sm text-gray-700 dark:text-gray-300 ml-2">
              {change.text}
            </span>
          </div>
        </div>
        <div className="text-gray-700 dark:text-gray-300">{icon}</div>
      </div>
    </div>
  )
}

// Add this interface
interface Transaction {
  client: {
    name: string
    role: string
    avatar: string
  }
  amount: string
  status: "Approved" | "Pending" | "Denied"
  date: string
}

export default function Dashboard() {
    
    useEffect(() => {
        document.title = "Dashboard | WindReact"
    }, [])

  // Data for charts
  const revenueData = [
    { year: "2013", value: 80 },
    { year: "2014", value: 110 },
    { year: "2015", value: 90 },
    { year: "2016", value: 120 },
    { year: "2017", value: 110 },
    { year: "2018", value: 170 },
    { year: "2019", value: 120 },
  ]

  const statisticsData = [
    { year: "2011", value: 100 },
    { year: "2013", value: 130 },
    { year: "2015", value: 110 },
    { year: "2017", value: 140 },
    { year: "2019", value: 130 },
  ]

  const salesData = [
    { name: "Apple Company", value: 30 },
    { name: "Other", value: 70 },
  ]

  // Add transactions data
  const transactions: Transaction[] = [
    {
      client: {
        name: "Hans Burger",
        role: "UX Developer",
        avatar: "/images/avatars/avt1.jpg",
      },
      amount: "$ 863.45",
      status: "Approved",
      date: "6/10/2020",
    },
    {
      client: {
        name: "Jolina Angelie",
        role: "Unemployed",
        avatar: "/images/avatars/avt2.png",
      },
      amount: "$ 369.95",
      status: "Pending",
      date: "6/10/2020",
    },
    {
      client: {
        name: "Sarah Curry",
        role: "Designer",
        avatar: "/images/avatars/avt3.png",
      },
      amount: "$ 86.00",
      status: "Denied",
      date: "6/10/2020",
    },
    {
      client: {
        name: "Rulia Joberts",
        role: "Actress",
        avatar: "/images/avatars/avt4.png",
      },
      amount: "$ 1276.45",
      status: "Approved",
      date: "6/10/2020",
    },
    {
      client: {
        name: "Hans Burger",
        role: "UX Developer",
        avatar: "/images/avatars/avt1.jpg",
      },
      amount: "$ 863.45",
      status: "Approved",
      date: "6/10/2020",
    },
    {
      client: {
        name: "Jolina Angelie",
        role: "Unemployed",
        avatar: "/images/avatars/avt2.png",
      },
      amount: "$ 369.95",
      status: "Pending",
      date: "6/10/2020",
    },
    {
      client: {
        name: "Sarah Curry",
        role: "Designer",
        avatar: "/images/avatars/avt3.png",
      },
      amount: "$ 86.00",
      status: "Denied",
      date: "6/10/2020",
    },
    {
      client: {
        name: "Hans Burger",
        role: "UX Developer",
        avatar: "/images/avatars/avt1.jpg",
      },
      amount: "$ 863.45",
      status: "Approved",
      date: "6/10/2020",
    },
    {
      client: {
        name: "Rulia Joberts",
        role: "Actress",
        avatar: "/images/avatars/avt4.png",
      },
      amount: "$ 1276.45",
      status: "Approved",
      date: "6/10/2020",
    },
    {
      client: {
        name: "Hans Burger",
        role: "UX Developer",
        avatar: "/images/avatars/avt1.jpg",
      },
      amount: "$ 863.45",
      status: "Approved",
      date: "6/10/2020",
    },
  ]

  const getStatusColor = (status: Transaction["status"]) => {
    switch (status) {
      case "Approved":
        return "text-green-700 bg-green-100 dark:text-green-100 dark:bg-green-800"
      case "Pending":
        return "text-orange-700 bg-orange-100 dark:text-orange-100 dark:bg-orange-800"
      case "Denied":
        return "text-red-700 bg-red-100 dark:text-red-100 dark:bg-red-800"
    }
  }

  return (
    <div className="container mx-auto px-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="ORDERS"
          value="1,587"
          change={{
            type: "increase",
            value: "11%",
            text: "From previous period",
          }}
          icon={<LayersIcon className="w-8 h-8" />}
        />
        <StatCard
          title="REVENUE"
          value="$46,782"
          change={{
            type: "decrease",
            value: "29%",
            text: "From previous period",
          }}
          icon={<CurrencyIcon className="w-8 h-8" />}
        />
        <StatCard
          title="AVERAGE PRICE"
          value="$15.9"
          change={{
            type: "increase",
            value: "0%",
            text: "From previous period",
          }}
          icon={<RefreshIcon className="w-8 h-8" />}
        />
        <StatCard
          title="PRODUCT SOLD"
          value="1,890"
          change={{ type: "increase", value: "89%", text: "Last year" }}
          icon={<CartIcon className="w-8 h-8" />}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Total Revenue
            </h3>
            <button
              className="text-gray-400 hover:text-gray-500"
              aria-label="More options"
            >
              <DotsIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <XAxis dataKey="year" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  $7841.12
                </p>
                <p className="text-sm text-gray-500">Total Revenue</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  17
                </p>
                <p className="text-sm text-gray-500">Open Campaign</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Statistics
            </h3>
            <button
              className="text-gray-400 hover:text-gray-500"
              aria-label="More options"
            >
              <DotsIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statisticsData}>
                <XAxis dataKey="year" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip />
                <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  $1875.54
                </p>
                <p className="text-sm text-gray-500">Revenue</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  541
                </p>
                <p className="text-sm text-gray-500">Total Offers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Sales Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Daily Sales
            </h3>
            <button
              className="text-gray-400 hover:text-gray-500"
              aria-label="More options"
            >
              <DotsIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Pie
                  data={salesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#3B82F6"
                  dataKey="value"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  5,459
                </p>
                <p className="text-sm text-gray-500">Total Sales</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  18
                </p>
                <p className="text-sm text-gray-500">Open Campaign</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="p-6">
          {/* Table Header - ซ่อนใน mobile */}
          <div className="hidden md:grid md:grid-cols-4 gap-4 mb-4 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            <div>Client</div>
            <div>Amount</div>
            <div>Status</div>
            <div>Date</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {transactions.map((transaction, index) => (
              <div
                key={index}
                className="py-4 space-y-3 md:space-y-0 md:grid md:grid-cols-4 md:gap-4 md:items-center"
              >
                {/* Client Info - แสดงแบบ stacked ใน mobile */}
                <div className="flex items-center">
                  <img
                    className="h-8 w-8 rounded-full"
                    src={transaction.client.avatar}
                    alt=""
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {transaction.client.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {transaction.client.role}
                    </p>
                  </div>
                </div>

                {/* Amount - เพิ่ม label ใน mobile */}
                <div className="flex items-center justify-between md:block">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 md:hidden">
                    Amount:
                  </span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {transaction.amount}
                  </span>
                </div>

                {/* Status - เพิ่ม label ใน mobile */}
                <div className="flex items-center justify-between md:block">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 md:hidden">
                    Status:
                  </span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                      transaction.status
                    )}`}
                  >
                    {transaction.status}
                  </span>
                </div>

                {/* Date - เพิ่ม label ใน mobile */}
                <div className="flex items-center justify-between md:block">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 md:hidden">
                    Date:
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {transaction.date}
                  </span>
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
function LayersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2L2 7L12 12L22 7L12 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 17L12 22L22 17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 12L12 17L22 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CurrencyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 1V23"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function RefreshIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 4V10H7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M23 20V14H17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20.49 9C19.9828 7.56678 19.1209 6.2854 17.9845 5.27542C16.8482 4.26543 15.4745 3.55976 13.9917 3.22426C12.5089 2.88875 10.9652 2.93434 9.50481 3.35677C8.04437 3.77921 6.71475 4.56471 5.64 5.64L1 10M23 14L18.36 18.36C17.2853 19.4353 15.9556 20.2208 14.4952 20.6432C13.0348 21.0657 11.4911 21.1112 10.0083 20.7757C8.52547 20.4402 7.1518 19.7346 6.01547 18.7246C4.87913 17.7146 4.01717 16.4332 3.51 15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1 1H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function DotsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 13C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11C18.4477 11 18 11.4477 18 12C18 12.5523 18.4477 13 19 13Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 13C5.55228 13 6 12.5523 6 12C6 11.4477 5.55228 11 5 11C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
