const createResponse = require('../Utils/Response');
const jwt = require('jsonwebtoken');
const request = require('request'); // for using nutrition api
const User = require('../Models/UserSchema');
require('dotenv').config();

async function AddCalorieIntakeHandler(req, res) {
    const { item, date, quantity, quantitytype } = req.body;
    console.log({ item, date, quantity, quantitytype });

    if (!item || !date || !quantity || !quantitytype) {
        return res.status(400).json(createResponse(false, 'Please provide all the details'));
    }

    let qtyingrams = 0;
    if (quantitytype === 'g') {
        qtyingrams = quantity;
    } else if (quantitytype === 'kg') {
        qtyingrams = quantity * 1000;
    } else if (quantitytype === 'ml') {
        qtyingrams = quantity;
    } else if (quantitytype === 'l') {
        qtyingrams = quantity * 1000;
    } else {
        return res.status(400).json(createResponse(false, 'Invalid quantity type'));
    }

    /* Api expire, new api i have to add for getting calories */

    // const query = item;
    // request.get({
    //     url: 'https://api.api-ninjas.com/v1/nutrition?query=' + query,
    //     headers: {
    //         'X-Api-Key': process.env.NUTRITION_API_KEY,
    //     },
    // }, async function (error, response, body) {
    //     if (error) return console.error('Request failed:', error);
    //     else if (response.statusCode != 200) return console.error('Error:', response.statusCode, body.toString('utf8'));

    //     body = JSON.parse(body);

    //     // Check if the API returned valid data
    //     if (!body || body.length === 0 || !body[0].calories || !body[0].serving_size_g) {
    //         return res.status(400).json(createResponse(false, 'Invalid item data from the nutrition API'));
    //     }
    //     console.log(body[0].calories);
    //     console.log(body[0].serving_size_g);
    //     const caloriesPerGram = body[0].calories / body[0].serving_size_g;
    //     console.log(caloriesPerGram);
    //     if (isNaN(caloriesPerGram)) {
    //         return res.status(400).json(createResponse(false, 'Error calculating calories'));
    //     }


    let caloriesPerGram = 0;
    for (let i = 0; i < item.length; i++) {

        if (item[i] >= 'a' && item[i] <= 'z') {
            caloriesPerGram += (item[i].charCodeAt(0) - 'a'.charCodeAt(0));
        }
        else if (item[i] >= 'A' && item[i] <= 'Z') {
            caloriesPerGram += (item[i].charCodeAt(0) - 'A'.charCodeAt(0));
        }
    }

    console.log(caloriesPerGram);

    let calorieIntake = (caloriesPerGram * qtyingrams) / 25;

    console.log(calorieIntake);

    const userId = req.userId;
    const user = await User.findOne({ _id: userId });

    if (!user) {
        return res.status(404).json(createResponse(false, 'User not found'));
    }

    user.calorieIntake.push({
        item,
        date: new Date(date),
        quantity,
        quantitytype,
        calorieIntake: parseInt(calorieIntake)
    });

    await user.save();
    res.json(createResponse(true, 'Calorie intake added successfully'));
    // });
}


async function GetCalorieIntakeByDateHandler(req, res) {
    const { date } = req.body;
    const userId = req.userId;
    const user = await User.findById({ _id: userId });
    if (!date) {
        let date = new Date();   // sept 1 2021 12:00:00
        user.calorieIntake = filterEntriesByDate(user.calorieIntake, date);

        return res.json(createResponse(true, 'Calorie intake for today', user.calorieIntake));
    }
    user.calorieIntake = filterEntriesByDate(user.calorieIntake, new Date(date));
    res.json(createResponse(true, 'Calorie intake for the date', user.calorieIntake));
}

async function GetCalorieIntakeByLimitHandler(req, res) {
    const { limit } = req.body;
    const userId = req.userId;
    const user = await User.findById({ _id: userId });
    console.log(limit);
    if (!limit) {
        return res.status(400).json(createResponse(false, 'Please provide limit'));
    } else if (limit === 'all') {
        return res.json(createResponse(true, 'Calorie intake', user.calorieIntake));
    }
    else {


        let date = new Date();
        let currentDate = new Date(date.setDate(date.getDate() - parseInt(limit))).getTime();
        // 1678910

        user.calorieIntake = user.calorieIntake.filter((item) => {
            return new Date(item.date).getTime() >= currentDate;
        })
        console.log(user.calorieIntake);
        const calorieIntakeByDate = {};

        // Iterate over the data and group by normalized date (YYYY-MM-DD)
        user.calorieIntake.forEach((item) => {
            // Normalize the date to YYYY-MM-DDT00:00:00.000Z
            const dateKey = new Date(item.date).toISOString().split('T')[0] + 'T00:00:00.000Z';

            // If this date already exists, sum up the calorie intake
            if (calorieIntakeByDate[dateKey]) {
                calorieIntakeByDate[dateKey] += item.calorieIntake;  // Sum the calorie intake
            } else {
                // Initialize with the first occurrence's calorie intake
                calorieIntakeByDate[dateKey] = item.calorieIntake;
            }
        });
        console.log(calorieIntakeByDate);
        // Convert the grouped data back into an array with only the date and calorieIntake fields
        let calorieData = Object.keys(calorieIntakeByDate).map((dateString) => {
            return {
                date: new Date(dateString),  // Ensure the format is correct
                value: calorieIntakeByDate[dateString]
            };
        });

        console.log(user.calorieIntake);
        return res.json(createResponse(true, `Calorie intake for the last ${limit} days`, calorieData));
    }
}

async function DeleteCalorieIntakeHandler(req, res) {
    const { item, date } = req.body;
    if (!item || !date) {
        return res.status(400).json(createResponse(false, 'Please provide all the details'));
    }

    const userId = req.userId;
    const user = await User.findById({ _id: userId });

    user.calorieIntake = user.calorieIntake.filter((item) => {
        return item.item != item && item.date != date;
    })
    await user.save();
    res.json(createResponse(true, 'Calorie intake deleted successfully'));
}

async function GetGoalCalorieIntakeHandler(req, res) {
    const userId = req.userId;
    const user = await User.findById({ _id: userId });
    let maxCalorieIntake = 0;
    let heightInCm = parseFloat(user.height[user.height.length - 1].height);
    let weightInKg = parseFloat(user.weight[user.weight.length - 1].weight);
    let age = new Date().getFullYear() - new Date(user.dob).getFullYear();
    let BMR = 0;
    let gender = user.gender;
    if (gender == 'male') {
        BMR = 88.362 + (13.397 * weightInKg) + (4.799 * heightInCm) - (5.677 * age)

    }
    else if (gender == 'female') {
        BMR = 447.593 + (9.247 * weightInKg) + (3.098 * heightInCm) - (4.330 * age)

    }
    else {
        BMR = 447.593 + (9.247 * weightInKg) + (3.098 * heightInCm) - (4.330 * age)
    }
    if (user.goal == 'weightLoss') {
        maxCalorieIntake = BMR - 500;
    }
    else if (user.goal == 'weightGain') {
        maxCalorieIntake = BMR + 500;
    }
    else {
        maxCalorieIntake = BMR;
    }

    res.json(createResponse(true, 'max calorie intake', { maxCalorieIntake }));

}

function filterEntriesByDate(entries, targetDate) {
    return entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return (
            entryDate.getDate() === targetDate.getDate() &&
            entryDate.getMonth() === targetDate.getMonth() &&
            entryDate.getFullYear() === targetDate.getFullYear()
        );
    });
}

module.exports = {
    AddCalorieIntakeHandler,
    GetCalorieIntakeByDateHandler,
    GetCalorieIntakeByLimitHandler,
    DeleteCalorieIntakeHandler,
    GetGoalCalorieIntakeHandler
}