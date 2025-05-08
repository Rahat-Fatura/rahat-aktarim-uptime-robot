const cron = require('node-cron');
const { maintananceService } = require('../services/');
const { maintananceTasks } = require('./tasks/maintananceTask');

const maintananceJob = () => {
    return cron.schedule('0 */1 * * * *', async () => {
        console.log('Maintanance Task job started');
        const maintanances = await maintananceService.runMaintananceTask();
        const run = Promise.allSettled(maintanances.map(async (maintanance) => {
        console.log('Maintanance Task job started for:', maintanance.id);
           maintananceTasks(maintanance);
        }));
    });
}



module.exports = {
    maintananceJob,
};  