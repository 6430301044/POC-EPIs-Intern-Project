import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/index';
import register from './routes/register'; 

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

app.use('/register', register);

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});