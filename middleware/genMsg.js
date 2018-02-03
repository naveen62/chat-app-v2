var moment = require('moment')

var genMsg = (from, text) => {
    return {
        from,
        text,
        created: moment().utcOffset('+05:30').format('h:mm A D/M/YYYY')

    }
}
module.exports = {
    genMsg,
}