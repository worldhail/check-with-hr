export default async function generatePayslipPeriod (schema) {
    const dateToday = new Date();
    const [ payout1, payout2 ] = [ 5, 20];
    const [ yearNow, monthNow, dateNow ] = [ dateToday.getFullYear(), dateToday.getMonth(), dateToday.getDate() ];
    const [ startPeriod1, endPeriod1, startPeriod2, endPeriod2 ] = [ 1, 15, 16, 0];
    
    // first cut off pay
    if (dateNow <= payout1 || dateNow >= payout2) {
        let periodMonth = dateNow > payout2 ? monthNow : monthNow - 1;
        const payoutDate =  new Date(yearNow, periodMonth, payout1)
        const startDate = new Date(yearNow, periodMonth, startPeriod2).toLocaleDateString();
        const endDate = new Date(yearNow, periodMonth + 1, endPeriod2).toLocaleDateString();
        schema['Employee']['Paid Out'] = payoutDate.toDateString();
        schema['Employee']['Pay Period'] = `${startDate} to ${endDate}`;
    } else {
        // second cut off pay
        const payoutDate =  new Date(yearNow, monthNow, payout2)
        const startDate = new Date(yearNow, monthNow, startPeriod1).toLocaleDateString();
        const endDate = new Date(yearNow, monthNow, endPeriod1).toLocaleDateString();
        schema['Employee']['Paid Out'] = payoutDate.toDateString();
        schema['Employee']['Pay Period'] = `${startDate} to ${endDate}`;
    }

    // to make an instance for the employee name and its pay date details
        await schema.populate('Employee.user');
        const user = schema['Employee'].user;
        schema['Employee'].name = `${user.firstName} ${user.middleName} ${user.lastName}`;
};