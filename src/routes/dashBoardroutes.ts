import express from 'express';
import {getFinancialData , 
    getAllCandidates,
    getCandidatesStats,getCandidatesByFilter, getLoanStatsByMonth ,getCandidatesCategory, getLoanStatisticsByMonth,
    getEmployeeDetailsSummary} from "../controllers/dashBoardController";

const router = express.Router();

// Route to get the total and balance amounts summary
router.get('/summary', getFinancialData);
router.get('/candidatescount', getAllCandidates);
router.get('/candidate-filters', getCandidatesByFilter);
router.get('/candidate-summary/:id', getEmployeeDetailsSummary);
router.get('/candidatestatus', getCandidatesStats);
router.get('/candidate/loans', getLoanStatsByMonth);
router.get('/candidate/category', getCandidatesCategory);
router.get('/candidate/loanstat', getLoanStatisticsByMonth);


export default router;

