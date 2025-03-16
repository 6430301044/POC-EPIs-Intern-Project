import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/index';
import registerRoutes from "./routes/registerRoutes";
import login from './routes/login';
import dotenv from "dotenv";
import { verifyToken } from './middleware/authMiddleware';
import uploadProfileRoutes from "./routes/uploadProfileRoutes";
import uploadNewsRoutes from "./routes/uploadNewsRoutes";
import uploadWebImageRoutes from "./routes/uploadWebImageRoutes";

dotenv.config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

app.use("/register", registerRoutes);

app.use('/login', login);

app.use("/upload/profile", uploadProfileRoutes);

app.use("/upload/news", uploadNewsRoutes);

app.use("/upload/webimage", uploadWebImageRoutes);


app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});