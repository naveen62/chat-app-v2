var moment = require('moment');

var genLocation = (from, latitude, longitude) => {
    return {
        from,
        latitude,
        longitude,
        created: moment().utcOffset('+05:30').format('h:mm A D/M/YYYY')
    }
}
module.exports = {
    genLocation,
}