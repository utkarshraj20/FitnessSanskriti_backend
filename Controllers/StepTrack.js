const User = require('../Models/UserSchema');
const getDayWiseResult = require('../Utils/GetDayWiseResult')
const createResponse = require('../Utils/Response');

async function AddStepEntryHandler(req, res){
    const { date, steps } = req.body;

    if (!date || !steps) {
        return res.status(400).json(createResponse(false, 'Please provide date and steps count'));
    }

    const userId = req.userId;
    const user = await User.findById({ _id: userId });

    user.steps.push({
        date: new Date(date),
        steps,
    });

    await user.save();
    res.json(createResponse(true, 'Steps entry added successfully'));
}

async function GetStepsByDateHandler(req, res){
    const { date } = req.body;
    const userId = req.userId;

    const user = await User.findById({ _id: userId });

    if (!date) {
        let date = new Date();
        user.steps = filterEntriesByDate(user.steps, date);

        return res.json(createResponse(true, 'Steps entries for today', user.steps));
    }

    user.steps = filterEntriesByDate(user.steps, new Date(date));
    res.json(createResponse(true, 'Steps entries for the date', user.steps));
}

async function GetStepsByLimitHandler(req, res){
    const { limit } = req.body;

    const userId = req.userId;
    const user = await User.findById({ _id: userId });

    if (!limit) {
        return res.status(400).json(createResponse(false, 'Please provide limit'));
    } else if (limit === 'all') {
        return res.json(createResponse(true, 'All steps entries', user.steps));
    } else {
        let date = new Date();
        let currentDate = new Date(date.setDate(date.getDate() - parseInt(limit))).getTime();

        user.steps = user.steps.filter((item) => {
            return new Date(item.date).getTime() >= currentDate;
        })

        const StepsPerDay = {} ;
        user.steps.forEach((item)=>{
            const dateKey = new Date(item.date).toISOString().split('T')[0] + 'T00:00:00.000Z' ;
            if( StepsPerDay[dateKey] ){
                StepsPerDay[dateKey] += item.steps;
            }
            else{
                StepsPerDay[dateKey] = item.steps;
            }
        })

        const dayWiseData = getDayWiseResult(StepsPerDay);

        return res.json(createResponse(true, `Steps entries for the last ${limit} days`, dayWiseData));
    }
}

async function DeleteStepEntryHandler(req, res){
    const { date } = req.body;

    if (!date) {
        return res.status(400).json(createResponse(false, 'Please provide date'));
    }

    const userId = req.userId;
    const user = await User.findById({ _id: userId });

    user.steps = user.steps.filter(entry => entry.date !== date);

    await user.save();
    res.json(createResponse(true, 'Steps entry deleted successfully'));
}

async function GetUserGoalStepsHandler(req, res){
    const userId = req.userId;
    const user = await User.findById({ _id: userId });

    let totalSteps = 0;

    if(user.goal == "weightLoss"){
        totalSteps = 10000;
    }
    else if(user.goal == "weightGain"){
        totalSteps = 5000;
    }
    else{
        totalSteps = 7500;
    }   

    res.json(createResponse(true, 'User steps information', { totalSteps }));
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
    AddStepEntryHandler,
    GetStepsByDateHandler,
    GetStepsByLimitHandler,
    DeleteStepEntryHandler,
    GetUserGoalStepsHandler
}