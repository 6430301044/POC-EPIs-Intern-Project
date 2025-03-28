import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
    const token = req.header('Authorization');
    if (!token) return res.status(401).send("Access Denied");

    jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
        if (err) return res.status(403).send("Invalid Token");
        (req as any).user = user;
        next();
    });
}
