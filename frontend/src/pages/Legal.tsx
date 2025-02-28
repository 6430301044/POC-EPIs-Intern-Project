import { useEffect } from "react"
import { Link } from "react-router"
import { SectionTitle } from "@/components/template/SectionTitle"

export default function Legal() {
  useEffect(() => {
    document.title = "Legal Information | WindReact"
  }, [])

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      <SectionTitle
        preTitle="Legal Center"
          title="Legal Information"
          align="center"
        >
          Important legal documents and policies for WindReact users
        </SectionTitle>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 max-w-4xl mx-auto">
          {/* Terms and Conditions Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <div className="text-indigo-600 dark:text-indigo-400 mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Terms and Conditions</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Our terms and conditions outline the rules, guidelines, and agreements for using WindReact services.
            </p>
            <Link 
              to="/terms" 
              className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              Read Terms
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Privacy Policy Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
            <div className="text-indigo-600 dark:text-indigo-400 mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Privacy Policy</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Learn how we collect, use, and protect your personal information when you use our services.
            </p>
            <Link 
              to="/privacy" 
              className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              Read Policy
              <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-16 max-w-3xl mx-auto text-center">
          <SectionTitle
            preTitle="Contact"
            title="Need Legal Assistance?"
            align="center"
          >
            If you have any questions about our legal documents or need assistance, please contact our legal team.
          </SectionTitle>
          
          <div className="mt-8 space-y-4 text-gray-600 dark:text-gray-300">
            <p>Email: legal@windreact.com</p>
            <p>Phone: (555) 123-4567</p>
            <p>Hours: Monday - Friday, 9:00 AM - 5:00 PM EST</p>
        </div>
      </div>
    </div>
  )
}
