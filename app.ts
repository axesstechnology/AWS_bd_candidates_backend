import express from "express";
import dotenv from "dotenv";
import cors from "cors"
import cookieParser from "cookie-parser";
import connectDB from "./src/config/db";
import authRoute from './src/routes/authRoute'
import employeeRoute from './src/routes/employeeRoute'
import leaveRoutes from './src/routes/leaveRoutes'
import locationRoutes from './src/routes/locationRoutes'
import companyHolidayRoute from './src/routes/companyHolidayRoute'
import form16Route from './src/routes/form16.routes'
import userSessionRoutes from "./src/routes/userSessionRoutes"
import candidateRoutes from "./src/routes/bdcandidatesroute"
import auditLogroutes from "./src/routes/auditLogroutes"
import financeLogroutes from "./src/routes/dashBoardroutes"

dotenv.config();
const app = express();
// middleares
app.use(cookieParser())
app.use(express.json({limit: '50mb'}));
app.use(cors({
    origin: process.env.FRONTEND_URL , 
    methods: ["GET", "POST", "PUT", "DELETE"], 
    credentials: true // Allow cookies and headers for authentication
  }));

// Connect to the database
connectDB();

console.log('Registering routes...');
app.use('/api/v1/leave', leaveRoutes);
app.use('/api/v1', authRoute);
app.use('/api/v1/employee', employeeRoute);
app.use('/api/v1', companyHolidayRoute);
app.use('/api/v1/checklocation', locationRoutes);
app.use('/api/v1/form16',form16Route );
app.use('/api/v1/sessions', userSessionRoutes);
app.use('/api/v1', candidateRoutes);
app.use('/api/v1', auditLogroutes);
app.use('/api/v1', financeLogroutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
