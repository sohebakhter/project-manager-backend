import { ObjectId } from 'mongodb';

export enum UserRole {
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    STAFF = 'STAFF'
}

export enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
}

export interface User {
    _id?: ObjectId;
    name: string;
    email: string;
    password?: string; // Optional because invites/registrations flow
    role: UserRole;
    status: UserStatus;
    invitedAt?: Date;
    createdAt: Date;
}

export interface Invite {
    _id?: ObjectId;
    email: string;
    role: UserRole;
    token: string;
    expiresAt: Date;
    used: boolean;
    usedAt?: Date;
    createdAt: Date;
}

export enum ProjectStatus {
    ACTIVE = 'ACTIVE',
    ARCHIVED = 'ARCHIVED',
    DELETED = 'DELETED'
}

export interface Project {
    _id?: ObjectId;
    name: string;
    description: string;
    status: ProjectStatus;
    isDeleted: boolean; // Soft delete flag
    createdBy: ObjectId; // User ID
    createdAt: Date;
    updatedAt: Date;
}
