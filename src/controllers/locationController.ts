import { Request, Response } from 'express';
import axios from 'axios';

interface IPInfoResponse {
  ip: string;
  city: string;
  region: string;
  country: string;
  loc: string;
  org: string;
  postal: string;
  timezone: string;
}
export const checkLocationPermission = async (req: Request, res: Response): Promise<void> => {
    try {
        // Extract IP from the request body
        const ip = req.body.ip || req.ip || req.socket.remoteAddress;

        // Use ipinfo.io to get location data
        const response = await axios.get(`https://ipinfo.io/${ip}/json?token=b5d731c660f3c1`);
        const { city, country, loc } = response.data;
        
        const [latitude, longitude] = loc.split(',').map(Number);

        // Send location response
        res.json({
            message: 'Location retrieved successfully.',
            location: {
                latitude,
                longitude,
                city,
                country
            }
        });
    } catch (error) {
        console.error('Error checking location:', error);
        res.status(500).json({
            message: 'Error occurred. Using default location.',
            location: {
                latitude: 20.5937,
                longitude: 78.9629,
                city: 'New Delhi',
                country: 'India'
            }
        });
    }
};