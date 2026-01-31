import { Request, Response } from 'express';
import { getDB } from '../db';
import { User, Invite, UserRole, UserStatus } from '../types';
import { hashPassword, comparePassword, generateToken } from '../utils/auth.utils';
import crypto from 'crypto';

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const db = getDB();
        const user = await db.collection<User>('users').findOne({ email });

        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        if (user.status !== UserStatus.ACTIVE) {
            res.status(403).json({ message: 'Account is inactive. Contact admin.' });
            return;
        }

        if (!user.password) {
            res.status(401).json({ message: 'Account setup incomplete.' });
            return;
        }

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const token = generateToken(user);
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const createInvite = async (req: Request, res: Response) => {
    try {
        const { email, role } = req.body;

        // Check if user already exists
        const db = getDB();
        const existingUser = await db.collection<User>('users').findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: 'User with this email already exists' });
            return;
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 48); // 48 hour expiry

        const invite: Invite = {
            email,
            role: role || UserRole.STAFF,
            token,
            expiresAt,
            used: false,
            createdAt: new Date()
        };

        await db.collection<Invite>('invites').insertOne(invite);

        // Context: In a real app we'd email this. For this task, we return it.
        const inviteLink = \`/register?token=\${token}\`;
    res.status(201).json({ message: 'Invite created', token, inviteLink });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const validateInvite = async (req: Request, res: Response) => {
    try {
        const { token } = req.body;
        const db = getDB();
        const invite = await db.collection<Invite>('invites').findOne({ token, used: false });

        if (!invite) {
            res.status(400).json({ message: 'Invalid or used invite token' });
            return;
        }

        if (new Date() > invite.expiresAt) {
            res.status(400).json({ message: 'Invite token expired' });
            return;
        }

        res.json({ isValid: true, email: invite.email, role: invite.role });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { token, name, password } = req.body;
    
    const db = getDB();
    const invite = await db.collection<Invite>('invites').findOne({ token, used: false });

    if (!invite) {
        res.status(400).json({ message: 'Invalid or used invite token' });
        return;
    }

    if (new Date() > invite.expiresAt) {
        res.status(400).json({ message: 'Invite token expired' });
        return;
    }

    const hashedPassword = await hashPassword(password);

    const newUser: User = {
        name,
        email: invite.email,
        password: hashedPassword,
        role: invite.role,
        status: UserStatus.ACTIVE,
        invitedAt: invite.createdAt,
        createdAt: new Date()
    };

    await db.collection<User>('users').insertOne(newUser);
    
    // Mark invite as used
    await db.collection<Invite>('invites').updateOne(
        { _id: invite._id },
        { $set: { used: true, usedAt: new Date() } }
    );

    res.status(201).json({ message: 'Registration successful. You can now login.' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
