import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// ตรวจสอบ token ว่าถูกต้องหรือไม่
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
    // ตรวจสอบ token จาก cookie ก่อน
    const tokenFromCookie = req.cookies?.token;
    
    // ถ้าไม่มี token ใน cookie ให้ตรวจสอบจาก Authorization header (สำหรับการเปลี่ยนผ่าน)
    const authHeader = req.header('Authorization');
    const tokenFromHeader = authHeader && authHeader.split(' ')[1]; // รองรับรูปแบบ Bearer token
    
    const token = tokenFromCookie || tokenFromHeader;
    
    if (!token) return res.status(401).json({ message: "Access Denied: No token provided" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        
        // ตรวจสอบการหมดอายุของ token
        const currentTime = Date.now() / 1000; // เวลาปัจจุบัน (วินาที)
        if ((decoded as any).exp < currentTime) {
            return res.status(401).json({ message: "Token has expired", expired: true });
        }
        
        (req as any).user = decoded;
        next();
    } catch (error) {
        if ((error as any).name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token has expired", expired: true });
        }
        return res.status(403).json({ message: "Invalid token" });
    }
}

// ตรวจสอบว่าผู้ใช้มีสิทธิ์ apperover หรือไม่
export function authorizeApperover(req: Request, res: Response, next: NextFunction) {
    if ((req as any).user && ((req as any).user.role === 'approver' || (req as any).user.role === 'dev')) {
        next();
    } else {
        res.status(403).json({ message: "Access Denied: Approver privileges required" });
    }
}

// ตรวจสอบว่าผู้ใช้มีสิทธิ์ตามที่กำหนดหรือไม่
export function authorizeRoles(roles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!(req as any).user) {
            return res.status(401).json({ message: "Access Denied: Authentication required" });
        }
        
        if (roles.includes((req as any).user.role)) {
            next();
        } else {
            res.status(403).json({ message: "Access Denied: Insufficient privileges" });
        }
    };
}

// ตรวจสอบว่าผู้ใช้มีสิทธิ์ admin หรือไม่
export function authorizeAdmin(req: Request, res: Response, next: NextFunction) {
    if ((req as any).user && (req as any).user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: "Access Denied: Admin privileges required" });
    }
}

// ตรวจสอบว่าผู้ใช้มีสิทธิ์ member หรือไม่
export function authorizeMember(req: Request, res: Response, next: NextFunction) {
    if ((req as any).user && (req as any).user.role === 'member') {
        next();
    } else {
        res.status(403).json({ message: "Access Denied: Member privileges required" });
    }
}

// ตรวจสอบว่าผู้ใช้มีสิทธิ์ dev หรือไม่
export function authorizeDev(req: Request, res: Response, next: NextFunction) {
    if ((req as any).user && (req as any).user.role === 'dev') {
        next();
    } else {
        res.status(403).json({ message: "Access Denied: Developer privileges required" });
    }
}

// ตรวจสอบว่าผู้ใช้มีสิทธิ์ในการจัดการข้อมูล (admin, approver, dev)
export function authorizeDataManager(req: Request, res: Response, next: NextFunction) {
    if ((req as any).user && ['admin', 'approver', 'dev'].includes((req as any).user.role)) {
        next();
    } else {
        res.status(403).json({ message: "Access Denied: Data management privileges required" });
    }
}
