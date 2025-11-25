"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seed...');
    // Create default daily tasks
    const tasks = [
        {
            title: 'Morning Check-In',
            description: 'Start your day with a positive mindset',
            points: 10,
            type: 'DAILY',
            action: 'MORNING_CHECKIN',
        },
        {
            title: 'Face Scan Verification',
            description: 'Verify your presence with a quick face scan',
            points: 20,
            type: 'DAILY',
            action: 'FACE_SCAN',
        },
        {
            title: 'Invite a Friend',
            description: 'Share the glow and invite someone to join',
            points: 25,
            type: 'DAILY',
            action: 'INVITE_FRIEND',
        },
        {
            title: 'Read Wellness Tip',
            description: 'Learn something new about wellness today',
            points: 5,
            type: 'DAILY',
            action: 'READ_TIP',
        },
        {
            title: 'Evening Reflection',
            description: 'Reflect on your day and set intentions',
            points: 5,
            type: 'DAILY',
            action: 'EVENING_REFLECTION',
        },
    ];
    for (const task of tasks) {
        const created = await prisma.task.upsert({
            where: { action: task.action },
            update: task,
            create: task,
        });
        console.log(`✅ Created/Updated task: ${created.title}`);
    }
    console.log('✨ Seed completed successfully!');
}
main()
    .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map