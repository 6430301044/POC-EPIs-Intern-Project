interface OTPRecord {
    otp: string;
    expiration: number;  // เวลาหมดอายุของ OTP (ในหน่วยมิลลิวินาที)
  }
  
  // ตัวแปรสำหรับเก็บ OTP ของผู้ใช้
  const otpStore: { [email: string]: OTPRecord } = {};
  
  // ฟังก์ชันสำหรับตรวจสอบว่า OTP หมดอายุหรือไม่
  const isOtpExpired = (email: string): boolean => {
    const record = otpStore[email];
    if (!record) return true;  // ถ้าไม่มี OTP เก็บไว้เลยก็ถือว่าหมดอายุ
    return Date.now() > record.expiration;
  };
  
  // ฟังก์ชันสำหรับลบ OTP ที่หมดอายุแล้ว
  const deleteExpiredOtp = (email: string) => {
    if (isOtpExpired(email)) {
      delete otpStore[email];
    }
  };
  
  export { otpStore, isOtpExpired, deleteExpiredOtp };
  