// controllers/userSessionController.ts
import { Request, Response } from 'express';
import UserSession, { IUserSession } from '../models/UserSession';



// Check-in function
export const checkIn = async (req: Request, res: Response): Promise<void> => {
    const { userId, name, userRole, email } = req.body.userInfo;

    try {
        // Find the user session document
        let userSession = await UserSession.findOne({ userId });

        if (!userSession) {
            userSession = new UserSession({
                userId,
                name,
                userRole,
                email,
                sessions: [{ checkInTime: new Date() }] // Start with a new session entry
            });
        } else {
            // Check if the last session has an open check-in (no check-out time)
            const lastSession = userSession.sessions[userSession.sessions.length - 1];

            if (!lastSession || lastSession.checkOutTime) {
                // If no open session, start a new one
                userSession.sessions.push({ checkInTime: new Date() });
            } else {
                res.status(400).json({ message: 'Already checked in, please check out first.' });
                return;
            }
        }

        await userSession.save();
        res.status(200).json({ message: 'Check-in successful' });
    } catch (error) {
        res.status(500).json({ message: 'Error during check-in', error });
    }
};

// Check-out function
export const checkOut = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.body.userInfo;

    try {
        const userSession = await UserSession.findOne({ userId });

        if (!userSession) {
            res.status(404).json({ message: 'User session not found' });
            return;
        }

        // Get the last session (the most recent check-in)
        const currentSession = userSession.sessions[userSession.sessions.length - 1];

        if (!currentSession || currentSession.checkOutTime) {
            res.status(400).json({ message: 'No active check-in session found to check out.' });
            return;
        }

        // Complete the session by adding a check-out time and calculating the total login hours
        currentSession.checkOutTime = new Date();
        currentSession.totalLoginHours = (currentSession.checkOutTime.getTime() - currentSession.checkInTime.getTime()) / (1000 * 60 * 60); // Convert to hours

        await userSession.save();

        res.status(200).json({
            message: 'Check-out successful',
            sessionInfo: {
                checkInTime: currentSession.checkInTime,
                checkOutTime: currentSession.checkOutTime,
                loginHours: currentSession.totalLoginHours
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error during check-out', error });
    }
};

  
  
