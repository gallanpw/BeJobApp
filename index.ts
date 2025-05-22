import express, { Application } from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import connectDB from './config/db';

import authRoutes from './routes/api/v1/authRoutes';
import categoryRoutes from './routes/api/v1/categoryRoutes';
import jobRoutes from './routes/api/v1/jobRoutes';
import applyJobRoutes from './routes/api/v1/applyJobRoutes';

dotenv.config();
connectDB();

const app: Application = express();
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

app.use(authRoutes);
app.use(categoryRoutes);
app.use(jobRoutes);
app.use(applyJobRoutes);

app.get('/', (req: express.Request, res: express.Response): void => {
  res.send('API OK');
});

if (!process.env.PORT || !process.env.HOST) {
  throw new Error('PORT and HOST must be defined in .env');
}
const PORT = parseInt(process.env.PORT, 10);
const HOST = process.env.HOST;
app.listen(PORT, HOST, () => console.log('Server running'));
