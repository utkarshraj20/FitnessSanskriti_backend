const User = require('../Models/UserSchema');
const createResponse = require('../Utils/Response');

async function AddSleepEntryHandler(req, res) {
    const { date, durationInHrs } = req.body;

    if (!date || !durationInHrs) {
        return res.status(400).json(createResponse(false, 'Please provide date and sleep duration'));
    }

    const userId = req.userId;
    const user = await User.findById({ _id: userId });

    user.sleep.push({
        date : new Date(date),
        durationInHrs,
    });

    await user.save();
    res.json(createResponse(true, 'Sleep entry added successfully'));
}

async function GetSleepByDateHandler(req, res){
    const { date } = req.body;
    const userId = req.userId;

    const user = await User.findById({ _id: userId });

    if (!date) {
        let date = new Date();
        user.sleep = filterEntriesByDate(user.sleep, date);

        return res.json(createResponse(true, 'Sleep entries for today', user.sleep));
    }

    user.sleep = filterEntriesByDate(user.sleep, new Date(date));
    res.json(createResponse(true, 'Sleep entries for the date', user.sleep));
}

async function GetSleepByLimitHandler(req, res) {
    const { limit } = req.body;

    const userId = req.userId;
    const user = await User.findById({ _id: userId });

    if (!limit) {
        return res.status(400).json(createResponse(false, 'Please provide limit'));
    } else if (limit === 'all') {
        return res.json(createResponse(true, 'All sleep entries', user.sleep));
    } else {

        let date = new Date();
        let currentDate = new Date(date.setDate(date.getDate() - parseInt(limit))).getTime();

        user.sleep = user.sleep.filter((item) => {
            return new Date(item.date).getTime() >= currentDate;
        })

        let sleepTakenByDate = {} ;
        
        user.sleep.forEach((item)=>{
            const dataKey = new Date(item.date).toISOString().split('T')[0] + 'T00:00:00.000Z';
            if(sleepTakenByDate[dataKey]){
                sleepTakenByDate[dataKey] += item.durationInHrs;
            }
            else{
                sleepTakenByDate[dataKey] = item.durationInHrs;
            }
        })

        const sleepData = Object.keys(sleepTakenByDate).map((dateString)=>{
            return{
                date: new Date(dateString),
                value: sleepTakenByDate[dateString]
            }
        })
        console.log(sleepData)
        return res.json(createResponse(true, `Sleep entries for the last ${limit} days`, sleepData));
    }
}

async function DeleteSleepEntryHandler(req, res){
    const { date } = req.body;

    if (!date) {
        return res.status(400).json(createResponse(false, 'Please provide date'));
    }

    const userId = req.userId;
    const user = await User.findById({ _id: userId });

    user.sleep = user.sleep.filter(entry => {
        return entry.date !== date;
    });

    await user.save();
    res.json(createResponse(true, 'Sleep entry deleted successfully'));
}

async function GetGoalSleepHandler(req, res){
    const userId = req.userId;
    const user = await User.findById({ _id: userId });

    const goalSleep = 6;

    res.json(createResponse(true, 'User max sleep information', {goalSleep }));
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
    AddSleepEntryHandler,
    GetSleepByDateHandler,
    GetSleepByLimitHandler,
    DeleteSleepEntryHandler,
    GetGoalSleepHandler
}