function getDayWiseResult( data ){
    const dayWiseData = Object.keys(data).map((dateString)=>{
        return{
            date: new Date(dateString),
            value: data[dateString]
        }
    })
    dayWiseData.sort((a, b) => a.date - b.date);
    return dayWiseData ;
}

module.exports = getDayWiseResult