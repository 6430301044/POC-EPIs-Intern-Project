import { SectionTitle } from "@/components/template/SectionTitle"
import { useEffect } from "react"

export default function Terms() {
  useEffect(() => {
    document.title = "Terms & Conditions | WindReact"
  }, [])

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      <SectionTitle
        preTitle="Legal"
          title="Terms and Conditions"
          align="center"
        >
          Last updated: January 26, 2025
        </SectionTitle>

        <div className="prose prose-lg dark:prose-invert mx-auto mt-8">
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">2. Use License</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Permission is granted to temporarily download one copy of the materials for personal, non-commercial transitory viewing only.</li>
              <li>This is the grant of a license, not a transfer of title.</li>
              <li>This license shall automatically terminate if you violate any of these restrictions.</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">3. Disclaimer</h2>
            <p>
              The materials on WindReact's website are provided on an 'as is' basis. WindReact makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">4. Limitations</h2>
            <p>
              In no event shall WindReact or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on WindReact's website.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">5. Privacy Policy</h2>
            <p>
              Your use of WindReact's website is also governed by our Privacy Policy. Please review our Privacy Policy, which also governs the site and informs users of our data collection practices.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">6. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">7. Contact Information</h2>
            <p>
              If you have any questions about these Terms and Conditions, please contact us at:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2">
              <li>Email: support@windreact.com</li>
              <li>Phone: (555) 123-4567</li>
              <li>Address: 123 Wind Street, React City, 12345</li>
            </ul>
          </section>
        </div>
    </div>
  )
}
