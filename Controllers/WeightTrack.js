const User = require('../Models/UserSchema');
const getDayWiseResult = require('../Utils/GetDayWiseResult');
const createResponse = require('../Utils/Response');

async function AddWeightEntryHandler(req, res){
    const { date, weightInKg } = req.body;
    if (!date || !weightInKg) {
        return res.status(400).json(createResponse(false, 'Please provide date and weight'));
    }

    const userId = req.userId;
    const user = await User.findById({ _id: userId });

    user.weight.push({
        date: new Date(date),
        weight : weightInKg,
    });

    await user.save();
    res.json(createResponse(true, 'Weight entry added successfully'));
}

async function GetWeightByDateHandler(req, res){
    const { date } = req.body;
    const userId = req.userId;

    const user = await User.findById({ _id: userId });

    if (!date) {
        let date = new Date();
        user.weight = filterEntriesByDate(user.weight, date);

        return res.json(createResponse(true, 'Weight entries for today', user.weight));
    }

    user.weight = filterEntriesByDate(user.weight, new Date(date));
    res.json(createResponse(true, 'Weight entries for the date', user.weight));
}

async function GetWeightByLimitHandler(req, res){
    const { limit } = req.body;

    const userId = req.userId;
    const user = await User.findById({ _id: userId });

    if (!limit) {
        return res.status(400).json(createResponse(false, 'Please provide limit'));
    } else if (limit === 'all') {
        return res.json(createResponse(true, 'All weight entries', user.weight));
    } else {
        let date = new Date();
        let currentDate = new Date(date.setDate(date.getDate() - parseInt(limit))).getTime();

 
        user.weight = user.weight.filter((item) => {
            return new Date(item.date).getTime() >= currentDate;
        })

        let weightEachDay = {};

        user.weight.forEach((item)=>{
            const dateKey = new Date(item.date).toISOString().split('T')[0] + 'T00:00:00.000Z';
            if( !weightEachDay[dateKey] ){
                weightEachDay[dateKey] = item.weight;
            }
        })

        const dataByDate = getDayWiseResult(weightEachDay);

        return res.json(createResponse(true, `Weight entries for the last ${limit} days`, dataByDate));
    }
}

async function DeleteWeightEntryHandler(req, res){
    const { date } = req.body;

    if (!date) {
        return res.status(400).json(createResponse(false, 'Please provide date'));
    }

    const userId = req.userId;
    const user = await User.findById({ _id: userId });

    user.weight = user.weight.filter(entry => entry.date !== date);

    await user.save();
    res.json(createResponse(true, 'Weight entry deleted successfully'));
}

async function GetUserGoalWeightHandler(req, res){
    const userId = req.userId;
    const user = await User.findById({ _id: userId });

    const currentWeight = user.weight.length > 0 ? user.weight[user.weight.length - 1].weight : null;
    const goalWeight = 22 * ((user.height[user.height.length - 1].height / 100) ** 2);

    res.json(createResponse(true, 'User goal weight information', { currentWeight, goalWeight }));
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
    AddWeightEntryHandler,
    GetWeightByDateHandler,
    GetWeightByLimitHandler,
    DeleteWeightEntryHandler,
    GetUserGoalWeightHandler
}