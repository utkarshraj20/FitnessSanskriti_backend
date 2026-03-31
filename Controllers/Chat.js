const User = require('../Models/UserSchema');
const createResponse = require('../Utils/Response');

function isSameDay(dateA, dateB) {
    return (
        dateA.getDate() === dateB.getDate() &&
        dateA.getMonth() === dateB.getMonth() &&
        dateA.getFullYear() === dateB.getFullYear()
    );
}

function entriesWithinDays(entries, days) {
    const now = new Date();
    const start = new Date();
    start.setDate(now.getDate() - days);

    return entries.filter((entry) => {
        const entryDate = new Date(entry.date);
        return entryDate >= start && entryDate <= now;
    });
}

function sumBy(entries, key) {
    return entries.reduce((total, entry) => total + Number(entry[key] || 0), 0);
}

function averageBy(entries, key) {
    if (!entries.length) return 0;
    return sumBy(entries, key) / entries.length;
}

function latestEntry(entries) {
    if (!entries.length) return null;
    return entries[entries.length - 1];
}

function buildUserContext(user) {
    const today = new Date();

    const todayCalories = user.calorieIntake.filter((entry) => isSameDay(new Date(entry.date), today));
    const todaySleep = user.sleep.filter((entry) => isSameDay(new Date(entry.date), today));
    const todaySteps = user.steps.filter((entry) => isSameDay(new Date(entry.date), today));
    const todayWater = user.water.filter((entry) => isSameDay(new Date(entry.date), today));
    const todayWorkout = user.workouts.filter((entry) => isSameDay(new Date(entry.date), today));

    const last7Sleep = entriesWithinDays(user.sleep, 7);
    const last7Steps = entriesWithinDays(user.steps, 7);
    const last7Water = entriesWithinDays(user.water, 7);
    const last7Workouts = entriesWithinDays(user.workouts, 7);
    const last7Calories = entriesWithinDays(user.calorieIntake, 7);

    const latestWeight = latestEntry(user.weight);
    const previousWeight = user.weight.length > 1 ? user.weight[user.weight.length - 2] : null;
    const latestHeight = latestEntry(user.height);

    return {
        name: user.name,
        email: user.email,
        gender: user.gender,
        dob: user.dob,
        goal: user.goal,
        activityLevel: user.activityLevel,
        latestWeightInKg: latestWeight ? latestWeight.weight : null,
        previousWeightInKg: previousWeight ? previousWeight.weight : null,
        latestHeightInCm: latestHeight ? latestHeight.height : null,
        today: {
            calorieIntake: sumBy(todayCalories, 'calorieIntake'),
            sleepHours: sumBy(todaySleep, 'durationInHrs'),
            steps: sumBy(todaySteps, 'steps'),
            waterMl: sumBy(todayWater, 'amountInMilliliters'),
            workoutMinutes: sumBy(todayWorkout, 'durationInMinutes'),
            workoutCount: todayWorkout.length,
        },
        last7Days: {
            avgCaloriesPerDay: Number(averageBy(last7Calories, 'calorieIntake').toFixed(2)),
            avgSleepHoursPerEntry: Number(averageBy(last7Sleep, 'durationInHrs').toFixed(2)),
            avgStepsPerEntry: Number(averageBy(last7Steps, 'steps').toFixed(2)),
            avgWaterMlPerEntry: Number(averageBy(last7Water, 'amountInMilliliters').toFixed(2)),
            totalWorkoutMinutes: sumBy(last7Workouts, 'durationInMinutes'),
            workoutSessions: last7Workouts.length,
        },
        recentWorkouts: user.workouts.slice(-5).map((entry) => ({
            exercise: entry.exercise,
            durationInMinutes: entry.durationInMinutes,
            date: entry.date,
        })),
    };
}

function buildGeminiPrompt({ message, history, userContext }) {
    const safeHistory = Array.isArray(history) ? history.slice(-8) : [];

    return [
        'You are FitnessSanskriti AI, a helpful fitness and wellness assistant inside a fitness tracking app.',
        'You can answer questions about exercise form, workout habits, recovery, general diet guidance, and progress based on the user data provided.',
        'Use the user data when the user asks about improvement, progress, consistency, or recommendations.',
        'Do not claim medical certainty. For injuries, medication, or serious health concerns, recommend consulting a qualified professional.',
        'Keep answers practical, supportive, and easy to understand.',
        '',
        `User profile and tracking context:\n${JSON.stringify(userContext, null, 2)}`,
        '',
        `Recent conversation history:\n${JSON.stringify(safeHistory, null, 2)}`,
        '',
        `User question: ${message}`,
    ].join('\n');
}

async function AskChatbotHandler(req, res, next) {
    try {
        const { message, history = [] } = req.body;

        if (!message || !String(message).trim()) {
            return res.status(400).json(createResponse(false, 'Please provide a message'));
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json(createResponse(false, 'Gemini API key is missing on the server'));
        }

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json(createResponse(false, 'User not found'));
        }

        const userContext = buildUserContext(user);
        const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
        const prompt = buildGeminiPrompt({ message: String(message).trim(), history, userContext });

        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': process.env.GEMINI_API_KEY,
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [{ text: prompt }],
                    },
                ],
            }),
        });

        const data = await geminiResponse.json();

        if (!geminiResponse.ok) {
            console.error('Gemini chat request failed:', data);
            return res.status(502).json(createResponse(false, 'Unable to get a response from Gemini right now'));
        }

        const reply = data?.candidates?.[0]?.content?.parts
            ?.map((part) => part.text)
            .filter(Boolean)
            .join('\n')
            .trim();

        if (!reply) {
            return res.status(502).json(createResponse(false, 'Gemini returned an empty response'));
        }

        return res.json(createResponse(true, 'Chat response generated successfully', { reply }));
    } catch (err) {
        next(err);
    }
}

module.exports = {
    AskChatbotHandler,
};
