require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const mongoose = require("mongoose");
const Workout = require("../Models/WorkoutSchema");

function svgDataUri(title, subtitle, accent) {
    const safeTitle = String(title).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safeSubtitle = String(subtitle).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
            <defs>
                <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#161616" />
                    <stop offset="100%" stop-color="#0a0a0a" />
                </linearGradient>
            </defs>
            <rect width="1200" height="800" fill="url(#bg)" rx="32" />
            <circle cx="1030" cy="170" r="170" fill="${accent}" opacity="0.16" />
            <circle cx="170" cy="650" r="220" fill="${accent}" opacity="0.1" />
            <rect x="80" y="96" width="148" height="16" rx="8" fill="${accent}" />
            <text x="80" y="250" fill="#ffffff" font-size="92" font-family="Arial, Helvetica, sans-serif" font-weight="700">
                ${safeTitle}
            </text>
            <text x="80" y="330" fill="#ffd56a" font-size="34" font-family="Arial, Helvetica, sans-serif" font-weight="600">
                ${safeSubtitle}
            </text>
            <text x="80" y="710" fill="#9a9a9a" font-size="28" font-family="Arial, Helvetica, sans-serif">
                FitnessSanskriti workout library
            </text>
        </svg>
    `.trim();

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const workouts = [
    {
        name: "Chest Strength",
        description: "Chest-focused push day built around strength and upper-body hypertrophy.",
        durationInMinutes: 45,
        imageURL: svgDataUri("Chest Strength", "Push day", "#ffc20e"),
        exercises: [
            {
                name: "Flat Bench Press",
                description: "Press the bar from mid-chest with a stable shoulder position and controlled lowering.",
                sets: 4,
                reps: 8,
                imageURL: svgDataUri("Flat Bench Press", "4 sets x 8 reps", "#ffc20e"),
            },
            {
                name: "Incline Dumbbell Press",
                description: "Drive dumbbells upward on a slight incline and squeeze the upper chest at the top.",
                sets: 3,
                reps: 10,
                imageURL: svgDataUri("Incline Dumbbell Press", "3 sets x 10 reps", "#ff9f43"),
            },
            {
                name: "Cable Fly",
                description: "Keep a soft bend in the elbows and bring the handles together in a smooth arc.",
                sets: 3,
                reps: 12,
                imageURL: svgDataUri("Cable Fly", "3 sets x 12 reps", "#ff6b6b"),
            },
        ],
    },
    {
        name: "Back Builder",
        description: "Pull-day workout for back width, posture, and pulling strength.",
        durationInMinutes: 50,
        imageURL: svgDataUri("Back Builder", "Pull day", "#4ecdc4"),
        exercises: [
            {
                name: "Deadlift",
                description: "Brace the core, keep the bar close, and drive through the floor with a neutral spine.",
                sets: 4,
                reps: 5,
                imageURL: svgDataUri("Deadlift", "4 sets x 5 reps", "#4ecdc4"),
            },
            {
                name: "Lat Pulldown",
                description: "Pull elbows toward the ribs and control the return for full lat engagement.",
                sets: 3,
                reps: 10,
                imageURL: svgDataUri("Lat Pulldown", "3 sets x 10 reps", "#1dd1a1"),
            },
            {
                name: "Seated Cable Row",
                description: "Sit tall, row into the torso, and squeeze the shoulder blades together.",
                sets: 3,
                reps: 12,
                imageURL: svgDataUri("Seated Cable Row", "3 sets x 12 reps", "#10ac84"),
            },
        ],
    },
    {
        name: "Leg Day",
        description: "Lower-body session for quads, hamstrings, glutes, and overall strength.",
        durationInMinutes: 55,
        imageURL: svgDataUri("Leg Day", "Lower body", "#54a0ff"),
        exercises: [
            {
                name: "Barbell Squat",
                description: "Stay braced, keep the chest proud, and drive up evenly through both feet.",
                sets: 4,
                reps: 6,
                imageURL: svgDataUri("Barbell Squat", "4 sets x 6 reps", "#54a0ff"),
            },
            {
                name: "Romanian Deadlift",
                description: "Hinge at the hips with soft knees and stretch the hamstrings through the descent.",
                sets: 3,
                reps: 8,
                imageURL: svgDataUri("Romanian Deadlift", "3 sets x 8 reps", "#2e86de"),
            },
            {
                name: "Walking Lunges",
                description: "Take long controlled steps and keep the torso upright throughout the movement.",
                sets: 3,
                reps: 12,
                imageURL: svgDataUri("Walking Lunges", "3 sets x 12 reps", "#5f27cd"),
            },
        ],
    },
    {
        name: "Shoulder Sculpt",
        description: "Balanced shoulder routine that hits pressing power and side-rear delt volume.",
        durationInMinutes: 40,
        imageURL: svgDataUri("Shoulder Sculpt", "Shoulders", "#f368e0"),
        exercises: [
            {
                name: "Seated Dumbbell Shoulder Press",
                description: "Press overhead without arching the lower back and keep the dumbbells under control.",
                sets: 4,
                reps: 8,
                imageURL: svgDataUri("Shoulder Press", "4 sets x 8 reps", "#f368e0"),
            },
            {
                name: "Lateral Raise",
                description: "Lift to shoulder height with soft elbows and avoid swinging the torso.",
                sets: 3,
                reps: 12,
                imageURL: svgDataUri("Lateral Raise", "3 sets x 12 reps", "#ff9ff3"),
            },
            {
                name: "Rear Delt Fly",
                description: "Hinge forward slightly and open the arms wide to target the rear delts.",
                sets: 3,
                reps: 15,
                imageURL: svgDataUri("Rear Delt Fly", "3 sets x 15 reps", "#ee5253"),
            },
        ],
    },
    {
        name: "Arm Blast",
        description: "Focused arm workout combining biceps and triceps for strength and shape.",
        durationInMinutes: 35,
        imageURL: svgDataUri("Arm Blast", "Arms", "#ff9f43"),
        exercises: [
            {
                name: "Barbell Curl",
                description: "Keep elbows fixed by the torso and curl with control instead of body swing.",
                sets: 3,
                reps: 10,
                imageURL: svgDataUri("Barbell Curl", "3 sets x 10 reps", "#ff9f43"),
            },
            {
                name: "Hammer Curl",
                description: "Use a neutral grip and bring the dumbbells up without rolling the shoulders forward.",
                sets: 3,
                reps: 12,
                imageURL: svgDataUri("Hammer Curl", "3 sets x 12 reps", "#feca57"),
            },
            {
                name: "Cable Triceps Pushdown",
                description: "Keep elbows tucked and fully extend the arms at the bottom of each rep.",
                sets: 3,
                reps: 12,
                imageURL: svgDataUri("Triceps Pushdown", "3 sets x 12 reps", "#ff6b6b"),
            },
        ],
    },
    {
        name: "Core Conditioning",
        description: "Core stability session for abs, anti-rotation control, and trunk endurance.",
        durationInMinutes: 30,
        imageURL: svgDataUri("Core Conditioning", "Core", "#1dd1a1"),
        exercises: [
            {
                name: "Plank",
                description: "Maintain a straight line from shoulders to heels while bracing the midsection.",
                sets: 3,
                reps: 45,
                imageURL: svgDataUri("Plank", "3 rounds x 45 sec", "#1dd1a1"),
            },
            {
                name: "Russian Twist",
                description: "Rotate through the torso with control and keep the chest lifted throughout.",
                sets: 3,
                reps: 20,
                imageURL: svgDataUri("Russian Twist", "3 sets x 20 reps", "#10ac84"),
            },
            {
                name: "Leg Raise",
                description: "Lift the legs without using momentum and keep the lower back under control.",
                sets: 3,
                reps: 15,
                imageURL: svgDataUri("Leg Raise", "3 sets x 15 reps", "#00d2d3"),
            },
        ],
    },
];

async function main() {
    await mongoose.connect(process.env.MONGO_URL, {
        dbName: process.env.DB_NAME,
        serverSelectionTimeoutMS: 15000,
    });

    const workoutNames = workouts.map((workout) => workout.name);

    for (const workout of workouts) {
        await Workout.findOneAndUpdate(
            { name: workout.name },
            workout,
            { upsert: true, returnDocument: "after", runValidators: true, setDefaultsOnInsert: true }
        );
    }

    await Workout.deleteMany({ name: { $nin: workoutNames } });

    const finalDocs = await Workout.find({}).sort({ name: 1 }).lean();
    console.log(JSON.stringify(finalDocs.map((doc) => ({
        id: String(doc._id),
        name: doc.name,
        durationInMinutes: doc.durationInMinutes,
        exercises: doc.exercises.length,
    })), null, 2));

    await mongoose.disconnect();
}

main().catch(async (error) => {
    console.error(error);
    try {
        await mongoose.disconnect();
    } catch (disconnectError) {
        console.error(disconnectError);
    }
    process.exit(1);
});
