import { Request, Response } from "express";
import Candidate from "../models/BdCanditates";
import moment from "moment";

interface MonthlyStat {
  loanCount: number;
  totalLoanAmount: number;
  totalBalanceAmount: number;
}

export const getFinancialData = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const summary = await Candidate.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" },
          totalBalanceAmount: { $sum: "$balanceAmount" },
        },
      },
      {
        $project: {
          _id: 0,
          totalAmount: 1,
          totalBalanceAmount: 1,
        },
      },
    ]);

    // If no documents exist, return zeros
    const result = summary[0] || {
      totalAmount: 0,
      totalBalanceAmount: 0,
    };

    // Use res to send the response
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    // Use res to send an error response
    res.status(500).json({
      success: false,
      error: "Failed to fetch financial data",
    });
  }
};


export const getAllCandidates = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const currentYear = moment().year();
    const months = moment.months();
    const monthlyData = [];

    for (let i = 0; i < 12; i++) {
      const startOfMonth = moment().year(currentYear).month(i).startOf("month");
      const endOfMonth = moment().year(currentYear).month(i).endOf("month");

 
      // Get total candidates for the month
      const totalCandidates = await Candidate.countDocuments({
        createdAt: {
          $gte: startOfMonth.toDate(),
          $lt: endOfMonth.toDate(),
        },
      });

      // Get onboarded candidates with their IDs for the month
      const onboardedCandidates = await Candidate.find({
        onboarded: true,
        createdAt: {
          $gte: startOfMonth.toDate(),
          $lt: endOfMonth.toDate(),
        }
      }).select('_id');

      // Get candidates with profile created with their IDs for the month
      const profileCreatedCandidates = await Candidate.find({
        profileCreatedOn: {
          $gte: startOfMonth.toDate(),
          $lt: endOfMonth.toDate(),
        }
      }).select('_id');

    
      // Push the monthly data to the array
      monthlyData.push({
        month: months[i],
        totalCandidates,
        onboarded: onboardedCandidates.length,
        onboardedIds: onboardedCandidates.map(candidate => candidate._id),
        profileCreated: profileCreatedCandidates.length,
        profileCreatedIds: profileCreatedCandidates.map(candidate => candidate._id),
      });
    }

    res.json({
      success: true,
      data: monthlyData,
    });
  } catch (error) {
    console.error("Error fetching monthly data:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal Server Error",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

export const getCandidatesStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Get counts by class
    const classCounts = await Candidate.aggregate([
      {
        $group: {
          _id: "$class",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          class: "$_id",
          count: 1,
          _id: 0,
        },
      },
    ]);

    // Get count of candidates who received offers
    const offersCount = await Candidate.countDocuments({
      didOfferReceived: true,
    });

    // Get class-wise offer counts
    const classWiseOffers = await Candidate.aggregate([
      {
        $match: { didOfferReceived: true },
      },
      {
        $group: {
          _id: "$class",
          offersCount: { $sum: 1 },
        },
      },
      {
        $project: {
          class: "$_id",
          offersCount: 1,
          _id: 0,
        },
      },
    ]);

    // Calculate additional statistics
    const totalCandidates = await Candidate.countDocuments();
    const offerRate =
      totalCandidates > 0
        ? ((offersCount / totalCandidates) * 100).toFixed(2)
        : 0;

    res.json({
      success: true,
      data: {
        classCounts,
        totalOffers: offersCount,
        classWiseOffers,
        statistics: {
          totalCandidates,
          offerRate: `${offerRate}%`,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching candidates statistics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch candidates statistics",
    });
  }
};

export const getLoanStatsByMonth = async (req: Request, res: Response) => {
  try {
    // Fetch all candidates with loans
    const loanCandidates = await Candidate.find({ loan: true });

    // Define a type for monthlyStats
    const monthlyStats: { [key: string]: MonthlyStat } = {}; // Ensure we are using a string key

    // Group by Month and Year based on `createdAt` field
    loanCandidates.forEach((candidate) => {
      const monthYear = moment(candidate.createdAt).format("YYYY-MM"); // Format as "YYYY-MM"

      // Initialize stats for this month if not already present
      if (!monthlyStats[monthYear]) {
        monthlyStats[monthYear] = {
          loanCount: 0,
          totalLoanAmount: 0,
          totalBalanceAmount: 0,
        };
      }

      // Add data to the month group
      monthlyStats[monthYear].loanCount += 1;
      monthlyStats[monthYear].totalLoanAmount +=
        candidate.loanSanctionAmount || 0;
      monthlyStats[monthYear].totalBalanceAmount +=
        candidate.balanceAmount || 0;
    });

    // Convert the grouped stats into an array format
    const result = Object.keys(monthlyStats).map((monthYear) => ({
      monthYear,
      ...monthlyStats[monthYear],
    }));

    // Respond with the aggregated data
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching loan stats:", error);
    res.status(500).json({ message: "Server Error", error: "server error" });
  }
};

export const getCandidatesCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Fetch candidates grouped by category with their IDs
    const categoriesData = await Candidate.aggregate([
      {
        $group: {
          _id: '$BDcategory',
          categoryCount: { $sum: 1 },
          candidates: {
            $push: {
              _id: '$_id',
              // Add other fields you want to include
              // name: '$name',
              // email: '$email',
              // etc.
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          categoryCount: 1,
          candidates: 1
        }
      }
    ]);

    // Calculate total candidates
    const totalCandidates = await Candidate.countDocuments();

    // Transform the data into the desired format
    const formattedResponse = {
      success: true,
      data: {
        totalCandidates,
        categories: categoriesData.reduce((acc: any, category) => {
          acc[category.category] = {
            count: category.categoryCount,
            candidates: category.candidates.map((candidate: any) => candidate._id)
          };
          return acc;
        }, {})
      }
    };

    res.json(formattedResponse);
  } catch (error) {
    console.error('Error fetching candidate categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch candidate categories'
    });
  }
};

export const getLoanStatisticsByMonth = async (req: Request, res: Response): Promise<void> => {
  try {
    // Aggregate data to group by month and 'loan' field with candidate IDs
    const loanStatistics = await Candidate.aggregate([
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" }, // Extract month from `createdAt`
            year: { $year: "$createdAt" }, // Extract year for differentiation
            hasLoan: "$loan", // Group by loan status (true/false)
          },
          count: { $sum: 1 }, // Count the number of candidates in each group
          candidateIds: { $push: "$_id" } // Collect candidate IDs
        }
      },
      {
        $group: {
          _id: { month: "$_id.month", year: "$_id.year" }, // Group by month and year
          loanCounts: {
            $push: {
              hasLoan: "$_id.hasLoan",
              count: "$count",
              candidateIds: "$candidateIds"
            }
          }
        }
      },
      {
        $sort: {
          "_id.year": 1, // Sort by year
          "_id.month": 1, // Sort by month
        }
      },
      {
        $project: {
          month: "$_id.month",
          year: "$_id.year",
          loan: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$loanCounts",
                  as: "item",
                  cond: { $eq: ["$$item.hasLoan", true] } // Filter loan=true
                }
              },
              0
            ]
          },
          noLoan: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$loanCounts",
                  as: "item",
                  cond: { $eq: ["$$item.hasLoan", false] } // Filter loan=false
                }
              },
              0
            ]
          }
        }
      },
      {
        $project: {
          month: 1,
          year: 1,
          loan: {
            count: { $ifNull: ["$loan.count", 0] }, // Handle missing loan counts
            candidateIds: { $ifNull: ["$loan.candidateIds", []] } // Handle missing loan candidate IDs
          },
          noLoan: {
            count: { $ifNull: ["$noLoan.count", 0] }, // Handle missing noLoan counts
            candidateIds: { $ifNull: ["$noLoan.candidateIds", []] } // Handle missing noLoan candidate IDs
          }
        }
      }
    ]);

    // Month name mapping
    const monthNames: { [key: number]: string } = {
      1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr", 5: "May", 6: "Jun",
      7: "Jul", 8: "Aug", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec"
    };

    // Calculate total people and restructure response with month names
    const response = loanStatistics.map((stat) => ({
      month: monthNames[stat.month], // Convert month number to month name
      year: stat.year,
      totalPeople: stat.loan.count + stat.noLoan.count,
      loan: {
        count: stat.loan.count,
        candidateIds: stat.loan.candidateIds
      },
      noLoan: {
        count: stat.noLoan.count,
        candidateIds: stat.noLoan.candidateIds
      }
    }));

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error("Error fetching loan statistics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch loan statistics"
    });
  }
};

export const getLoanCandidatesByMonth = async (req: Request, res: Response): Promise<void> => {
  try {
    const { month, year, hasLoan } = req.query;

    if (!month || !year || hasLoan === undefined) {
      res.status(400).json({
        success: false,
        error: "Month, year, and loan status are required"
      });
      return;
    }

    const candidates = await Candidate.find({
      $expr: {
        $and: [
          { $eq: [{ $month: "$createdAt" }, parseInt(month as string)] },
          { $eq: [{ $year: "$createdAt" }, parseInt(year as string)] },
          { $eq: ["$loan", hasLoan === 'true'] }
        ]
      }
    }).select('_id name email phone loan'); // Select fields you want to return

    res.json({
      success: true,
      data: candidates
    });
  } catch (error) {
    console.error("Error fetching loan candidates:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch loan candidates"
    });
  }
};


export const getCandidatesByFilter = async (req: Request, res: Response): Promise<void> => {
  try {
    const { filter } = req.query; // Get the filter from query parameters

    if (!filter) {
      res.status(400).json({
        success: false,
        error: "'filter' query parameter is required."
      });
      return;
    }

    // Build the query dynamically
    const query: any = {};
    if (filter === "profilecreated") {
      query.profilecreated = true;
    } else if (filter === "onboarded") {
      query.onboarded = true;
    }else if (filter === "loan") {
      query.loan = true;
    } else {
      res.status(400).json({
        success: false,
        error: "Invalid filter value. Allowed values are 'profilecreated' or 'onboarded'."
      });
      return;
    }

    // Fetch candidates based on the query
    const candidates = await Candidate.find(query).select(
      "_id fullName email phone profilecreated onboarded loan"
    ); // Select fields to return

    res.json({
      success: true,
      data: candidates
    });
  } catch (error) {
    console.error("Error fetching candidates by filter:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch candidates by filter."
    });
  }
};


export const getEmployeeDetailsSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: "'id' parameter is required."
      });
      return;
    }

    // Fetch the candidate details based on the ID
    const candidate = await Candidate.findById(id).select(
      "_id dateOfOffer class documentsSubmitted backDoorId isActive inactivereason fullName agreementDate profileCreatedOn BDcategory agreement acknowledgement totalAmount balanceAmount fullname class loan profilecreated videoshooted modelready didOfferReceived"
    ); 

    if (!candidate) {
      res.status(404).json({
        success: false,
        error: "Employee not found."
      });
      return;
    }

    res.json({
      success: true,
      data: candidate
    });
  } catch (error) {
    console.error("Error fetching employee details:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch employee details."
    });
  }
};
