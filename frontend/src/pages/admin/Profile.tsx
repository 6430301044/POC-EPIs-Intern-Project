import { Container } from '@/components/template/Container'
import { SectionTitle } from '@/components/template/SectionTitle'
import React, { useState, useEffect } from 'react'
import { getDecodedToken } from '@/utils/authUtils'
import API_BASE_URL from '@/config/apiConfig'

interface UserProfile {
  userId: string
  name: string
  email: string
  role: string
  jobPosition: string
  phone: string
  company: string
  imageUrl?: string
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [uploading, setUploading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')

  // ดึงข้อมูลผู้ใช้จาก token
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        if (!token) {
          setError('ไม่พบข้อมูลการเข้าสู่ระบบ')
          setLoading(false)
          return
        }

        const decoded = getDecodedToken()
        if (!decoded) {
          setError('ไม่สามารถอ่านข้อมูลผู้ใช้ได้')
          setLoading(false)
          return
        }

        // ใช้ imageUrl จาก token โดยตรง
        if (decoded.imageUrl) {
          setPreviewUrl(decoded.imageUrl)
        }

        // สร้างข้อมูลผู้ใช้จาก token
        setProfile({
          userId: decoded.userId,
          name: decoded.name || 'ไม่ระบุชื่อ',
          email: decoded.email || 'ไม่ระบุอีเมล',
          role: decoded.role || 'ไม่ระบุบทบาท',
          jobPosition: decoded.jobPosition || 'ไม่ระบุตำแหน่ง',
          phone: decoded.phone || 'ไม่ระบุเบอร์โทรศัพท์',
          company: decoded.companyName || 'ไม่ระบุบริษัท',
          imageUrl: decoded.imageUrl || 'https://episstorageblob.blob.core.windows.net/profile/defaultProfileImage.jpg'
        })

        setLoading(false)
      } catch (error) {
        console.error('Error fetching profile:', error)
        setError('ไม่สามารถดึงข้อมูลโปรไฟล์ได้')
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, []) // เรียกใช้เมื่อ component mount

  // อัพเดทรูปภาพตัวอย่างเมื่อมีการเลือกไฟล์
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // ตรวจสอบประเภทไฟล์
    const validTypes = ['image/jpeg', 'image/png', 'image/gif']
    if (!validTypes.includes(file.type)) {
      setError('กรุณาเลือกไฟล์รูปภาพ (JPEG, PNG, GIF)')
      return
    }

    // ตรวจสอบขนาดไฟล์ (ไม่เกิน 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('ขนาดไฟล์ต้องไม่เกิน 2MB')
      return
    }

    setSelectedFile(file)
    setError('') // ล้าง error

    // สร้าง URL สำหรับแสดงตัวอย่าง
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // อัพโหลดรูปภาพ
  const handleUpload = async () => {
    if (!selectedFile || !profile) return

    try {
      setUploading(true)
      setError('')
      setSuccess('')

      const token = localStorage.getItem('token')
      if (!token) {
        setError('ไม่พบข้อมูลการเข้าสู่ระบบ')
        setUploading(false)
        return
      }

      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('user_id', profile.userId)

      const response = await fetch(`${API_BASE_URL}/user/image/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess('อัพโหลดรูปภาพสำเร็จ')
        // อัพเดทข้อมูลโปรไฟล์
        setProfile({
          ...profile,
          imageUrl: data.imageUrl
        })
        
        // รีเฟรชหน้าเว็บหลังจากอัพโหลดสำเร็จเพื่อให้รปโปรไฟล์อัพเดท
        setTimeout(() => {
          window.location.reload()
        }, 1500) // รอให้ผู้ใช้เห็นข้อความสำเร็จก่อน
      } else {
        setError(data.message || 'เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setError('เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ')
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
      <Container>
        <SectionTitle 
          title='โปรไฟล์ผู้ใช้'
          align='center'
        />
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error && !profile ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        ) : profile && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <img 
                    src={previewUrl || profile.imageUrl || 'https://episstorageblob.blob.core.windows.net/profile/defaultProfileImage.jpg'} 
                    alt="Profile" 
                    className="w-32 h-32 rounded-full object-cover border-4 border-indigo-100 dark:border-gray-700"
                  />
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-center">
                  <label className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors">
                    <span>เปลี่ยนรูปโปรไฟล์</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/jpeg,image/png,image/gif"
                      onChange={handleFileChange}
                      disabled={uploading}
                    />
                  </label>
                  
                  {selectedFile && (
                    <button 
                      onClick={handleUpload}
                      disabled={uploading}
                      className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                    >
                      {uploading ? 'กำลังอัพโหลด...' : 'อัพโหลด'}
                    </button>
                  )}
                  
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    PNG, JPG, GIF ขนาดไม่เกิน 2MB
                  </p>
                  
                  {error && (
                    <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                      {error}
                    </div>
                  )}
                  
                  {success && (
                    <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                      {success}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Profile Info */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profile.name}
                </h2>
                <p className="text-indigo-600 dark:text-indigo-400 font-medium">
                  {profile.jobPosition}
                </p>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  {profile.role}
                </p>
                
                <div className="mt-4 grid grid-cols-1 gap-3">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">{profile.email}</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">{profile.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m-1 4h1m4-1h1m-1-4h1m-1-4h1m-1-4h1" />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">{profile.company}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Container>
    </>
  )
}
