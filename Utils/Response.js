function createResponse( ok , message , data ){
    return{
        ok,
        message,
        data
    }
}

module.exports = createResponse