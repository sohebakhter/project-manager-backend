import { Request, Response } from 'express';
import { getDB } from '../db';
import { User, UserRole, UserStatus } from '../types';
import { ObjectId } from 'mongodb';

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const db = getDB();
        const users = await db.collection<User>('users').find({}, { projection: { password: 0 } }).toArray();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const updateUserRole = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!Object.values(UserRole).includes(role)) {
            res.status(400).json({ message: 'Invalid role' });
            return;
        }

        const db = getDB();
        const result = await db.collection<User>('users').updateOne(
            { _id: new ObjectId(id) },
            { $set: { role } }
        );

        if (result.matchedCount === 0) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.json({ message: 'User role updated' });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const updateUserStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!Object.values(UserStatus).includes(status)) {
            res.status(400).json({ message: 'Invalid status' });
            return;
        }

        const db = getDB();
        const result = await db.collection<User>('users').updateOne(
            { _id: new ObjectId(id) },
            { $set: { status } }
        );

        if (result.matchedCount === 0) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.json({ message: 'User status updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
