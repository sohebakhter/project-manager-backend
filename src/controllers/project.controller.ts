import { Request, Response } from 'express';
import { getDB } from '../db';
import { Project, ProjectStatus, User } from '../types';
import { ObjectId } from 'mongodb';

export const createProject = async (req: Request, res: Response) => {
    try {
        const { name, description } = req.body;
        const createdBy = new ObjectId(req.user.id);

        const newProject: Project = {
            name,
            description,
            status: ProjectStatus.ACTIVE,
            isDeleted: false,
            createdBy,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const db = getDB();
        await db.collection<Project>('projects').insertOne(newProject);
        res.status(201).json({ message: 'Project created', project: newProject });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getProjects = async (req: Request, res: Response) => {
    try {
        const db = getDB();
        // Return all non-deleted projects
        const projects = await db.collection<Project>('projects')
            .aggregate([
                { $match: { isDeleted: false } },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'createdBy',
                        foreignField: '_id',
                        as: 'creator'
                    }
                },
                { $unwind: { path: '$creator', preserveNullAndEmptyArrays: true } },
                { $project: { 'creator.password': 0 } }
            ]).toArray();

        // Note: For now, all authenticated users can see all projects as per requirement:
        // "Non-admin users can view projects"
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const updateProject = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, description, status } = req.body;

        const db = getDB();

        const updateDoc: any = { updatedAt: new Date() };
        if (name) updateDoc.name = name;
        if (description) updateDoc.description = description;
        if (status) updateDoc.status = status;

        const result = await db.collection<Project>('projects').updateOne(
            { _id: new ObjectId(id as string) },
            { $set: updateDoc }
        );

        if (result.matchedCount === 0) {
            res.status(404).json({ message: 'Project not found' });
            return;
        }

        res.json({ message: 'Project updated' });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const deleteProject = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const db = getDB();

        // Soft delete
        const result = await db.collection<Project>('projects').updateOne(
            { _id: new ObjectId(id as string) },
            { $set: { isDeleted: true, updatedAt: new Date() } }
        );

        if (result.matchedCount === 0) {
            res.status(404).json({ message: 'Project not found' });
            return;
        }

        res.json({ message: 'Project deleted' });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
