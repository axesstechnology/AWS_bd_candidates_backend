import { Request, Response } from 'express';
import companyHolidays, { IHoliday } from '../models/CompanyHolidays';

// Add a new company holiday
export const addCompanyHoliday = async (req: Request, res: Response): Promise<void> => {
  const { title, date, type, description } = req.body;

  if (!title || !date || !type || !description) {
    res.status(400).json({ error: 'All fields are required: title, date, type, and description' });
    return; // Ensure you stop further execution
  }

  try {
    const newHoliday: IHoliday = new companyHolidays({ title, date, type, description });
    await newHoliday.save();
    res.status(201).json(newHoliday); // Send response here without returning it
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all company holidays
export const getAllCompanyHolidays = async (req: Request, res: Response): Promise<void> => {
  try {
    const holidays: IHoliday[] = await companyHolidays.find();
    res.json({
      message: "success",
      data: holidays
    }); // Send response here
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Update a company holiday
export const updateCompanyHoliday = async (req: Request, res: Response): Promise<void> => {
  const { title, date, type, description } = req.body;

  if (!title || !date || !type || !description) {
    res.status(400).json({ error: 'All fields are required: title, date, type, and description' });
    return; // Stop further execution
  }

  try {
    const updatedHoliday: IHoliday | null = await companyHolidays.findByIdAndUpdate(
      req.params.id,
      { title, date, type, description },
      { new: true }
    );

    if (!updatedHoliday) {
      res.status(404).json({ error: 'Holiday not found' });
      return; // Stop further execution
    }

    res.json(updatedHoliday); // Send the response here
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete a company holiday
export const deleteCompanyHoliday = async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedHoliday: IHoliday | null = await companyHolidays.findByIdAndDelete(req.params.id);

    if (!deletedHoliday) {
      res.status(404).json({ error: 'Holiday not found' });
      return; // Stop further execution
    }

    res.json({ message: 'Holiday deleted successfully' }); // Send the response here
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
