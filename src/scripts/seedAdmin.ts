import { connectDB, closeDB } from '../db';
import { User, UserRole, UserStatus } from '../types';
import { hashPassword } from '../utils/auth.utils';

const seedAdmin = async () => {
    try {
        const db = await connectDB();
        const usersCollection = db.collection<User>('users');

        const adminEmail = 'admin@admin.com';
        const existingAdmin = await usersCollection.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('Admin already exists');
            await closeDB();
            return;
        }

        const hashedPassword = await hashPassword('admin123');

        const adminUser: User = {
            name: 'Super Admin',
            email: adminEmail,
            password: hashedPassword,
            role: UserRole.ADMIN,
            status: UserStatus.ACTIVE,
            createdAt: new Date()
        };

        await usersCollection.insertOne(adminUser);
        console.log(`Admin created successfully.\nEmail: ${adminEmail}\nPassword: admin123`);

    } catch (error) {
        console.error('Error seeding admin:', error);
    } finally {
        await closeDB();
        process.exit(0);
    }
};

seedAdmin();
