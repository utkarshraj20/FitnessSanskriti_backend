function getDayWiseResult( data ){
    const dayWiseData = Object.keys(data).map((dateString)=>{
        return{
            date: new Date(dateString),
            value: data[dateString]
        }
    })
    return dayWiseData ;
}

module.exports = getDayWiseResult