import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/index';
import uploadNewsRoutes from './routes/uploadNewsRoutes';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

app.use('/upload/news', uploadNewsRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});