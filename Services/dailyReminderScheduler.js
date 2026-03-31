const cron = require('node-cron');
const nodemailer = require('nodemailer');
const User = require('../Models/UserSchema');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.COMPANY_EMAIL || 'utkarshmahiyan@gmail.com',
        pass: process.env.COMPANY_EMAIL_PASSWORD || 'rnrbcfypwvypnquk',
    },
});

async function sendDailyReminderEmails() {
    try {
        const users = await User.find({}, { name: 1, email: 1 }).lean();

        if (!users.length) {
            console.log('Daily reminder skipped: no users found');
            return;
        }

        await Promise.allSettled(
            users.map((user) => {
                if (!user.email) {
                    return Promise.resolve();
                }

                return transporter.sendMail({
                    from: process.env.COMPANY_EMAIL || 'utkarshmahiyan@gmail.com',
                    to: user.email,
                    subject: 'Reminder to update today\'s fitness data',
                    text:
                        `Hi ${user.name || 'there'},\n\n` +
                        `This is your daily reminder from FitnessSanskriti to update today's health and fitness data.\n\n` +
                        `Please take a moment to log:\n` +
                        `- Calorie intake\n` +
                        `- Water intake\n` +
                        `- Sleep\n` +
                        `- Steps\n` +
                        `- Workout\n` +
                        `- Weight\n\n` +
                        `Keeping your daily entries up to date helps your reports stay accurate and useful.\n\n` +
                        `Best regards,\n` +
                        `FitnessSanskriti`,
                });
            })
        );

        console.log(`Daily reminder emails processed for ${users.length} user(s)`);
    } catch (error) {
        console.error('Daily reminder scheduler error:', error.message);
    }
}

function startDailyReminderScheduler() {
    const task = cron.schedule(
        '0 21 * * *',
        () => {
            sendDailyReminderEmails();
        },
        {
            timezone: 'Asia/Kolkata',
        }
    );

    console.log('Daily reminder scheduler started for 9:00 PM Asia/Kolkata');
    return task;
}

module.exports = {
    startDailyReminderScheduler,
    sendDailyReminderEmails,
};
