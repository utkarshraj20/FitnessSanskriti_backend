const User = require('../Models/UserSchema');
const getDayWiseResult = require('../Utils/GetDayWiseResult');
const createResponse = require('../Utils/Response')

async function AddWaterEntryHandler(req, res){
    const { date, amountInMilliliters } = req.body;

    if (!date || !amountInMilliliters) {
        return res.status(400).json(createResponse(false, 'Please provide date and water amount'));
    }

    const userId = req.userId;
    const user = await User.findById({ _id: userId });


    user.water.push({
        date: new Date(date),
        amountInMilliliters,
    });

    await user.save();


    res.json(createResponse(true, 'Water entry added successfully'));
}

async function GetWaterByDateHandler(req, res){
    const { date } = req.body;
    const userId = req.userId;

    const user = await User.findById({ _id: userId });

    if (!date) {
        let date = new Date();
        user.water = filterEntriesByDate(user.water, date);

        return res.json(createResponse(true, 'Water entries for today', user.water));
    }

    user.water = filterEntriesByDate(user.water, new Date(date));
    res.json(createResponse(true, 'Water entries for the date', user.water));
}

async function GetWaterByLimitHandler(req, res){
    const { limit } = req.body;

    const userId = req.userId;
    const user = await User.findById({ _id: userId });

    if (!limit) {
        return res.status(400).json(createResponse(false, 'Please provide limit'));
    } else if (limit === 'all') {
        return res.json(createResponse(true, 'All water entries', user.water));
    } else {
        let date = new Date();
        let currentDate = new Date(date.setDate(date.getDate() - parseInt(limit))).getTime();

       
        user.water = user.water.filter((item) => {
            return new Date(item.date).getTime() >= currentDate;
        });

        let waterIntakePerDay = {} ;
        user.water.forEach((item)=>{
            const dateKey = new Date(item.date).toISOString().split('T')[0] + 'T00:00:00.000Z' ;
            if( waterIntakePerDay[dateKey] ){
                waterIntakePerDay[dateKey] += item.amountInMilliliters ;
            }
            else{
                waterIntakePerDay[dateKey] = item.amountInMilliliters ;
            }
        })

        console.log(waterIntakePerDay)

        const dayWiseData = getDayWiseResult(waterIntakePerDay);

        return res.json(createResponse(true, `Water entries for the last ${limit} days`, dayWiseData));
    }
}

async function DeleteWaterEntryHandler(req, res){
    const { date } = req.body;

    if (!date) {
        return res.status(400).json(createResponse(false, 'Please provide date'));
    }

    const userId = req.userId;
    const user = await User.findById({ _id: userId });

    user.water = user.water.filter(entry => entry.date !== date);

    await user.save();
    res.json(createResponse(true, 'Water entry deleted successfully'));
}

async function GetGoalWaterHandler(req, res){
    const userId = req.userId;
    const user = await User.findById({ _id: userId });

    const goalWater = 4000; // Set your goal water intake here in milliliters

    res.json(createResponse(true, 'User max water information', {goalWater}));
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
    AddWaterEntryHandler,
    GetWaterByDateHandler,
    GetWaterByLimitHandler,
    DeleteWaterEntryHandler,
    GetGoalWaterHandler
}