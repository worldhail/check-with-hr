// NPM PACKAGES
const mongoose = require('mongoose');

// ENUM FOR HOURLY TYPE
const hourType = [
    'Regular Hours',
    'Regular Overtime Hours',
    'Regular Night Shift Hours',
    'Regular OT NS Hours',
    'Regular Holiday Hours',
    'Regular Holiday OT Hours',
    'Regular Holiday NS Hours',
    'Regular Holiday OT NS Hours',
    'Special NWD or RD Hours',
    'Special NWD or RD OT Hours',
    'Special NWD or RD NS Hours',
    'Special NWD or RD OT NS Hours',
    'Special NWD + RD Hours',
    'Special NWD + RD OT',
    'Special NWD + RD NS', 
    'Special NWD + RD OT NS',
    'Paid Unworked Hours (Sick / Vac / Credits)'
];

// SCHEMA
const earningsSchema = new mongoose.Schema({
    'Earnings from Hours Worked': { type: Number, default: 0 },
    'Performance Bonus / Attendance bonus': { type: Number, default: 0 },
    'Other Earnings / Relocation / Referral': { type: Number, default: 0 },
    'Total Earnings': { type: Number, default: 0 },
},);

const contriAndDeductSchema = new mongoose.Schema({
    'Pag-IBIG': { type: Number, default: 0 },
    'SSS': { type: Number, default: 0 },
    'Philhealth': { type: Number, default: 0 },
    'BIR Withholding Tax': { type: Number, default: 0 },
    'SSS Loan Repayment': { type: Number, default: 0 },
    'Pagibig Loan Repayment': { type: Number, default: 0 },
    'Other Deductions': { type: Number, default: 0 },
    'Total Contributions & Deductions': { type: Number, default: 0 },
});

const allowanceSchema = new mongoose.Schema({
    'Rice Allowance': { type: Number, default: 0 },
    'Laundry Allowance': { type: Number, default: 0 },
    'Medical Cash Allowance': { type: Number, default: 0 },
    'Uniform Allowance': { type: Number, default: 0 },
    'Employee Pag-IBIG share paid by Smiles': { type: Number, default: 0 },
    'Employee Philhealth share paid by Smiles': { type: Number, default: 0 },
    '13th Month': { type: Number, default: 0 },
    'Complexity Pay': { type: Number, default: 0 },
    'Other Allowances': { type: Number, default: 0 },
    'Total Allowances': { type: Number, default: 0 },
});

const breakdownSchema = new mongoose.Schema({
    'Hour Type': { type: String, enum: hourType },
    'Hours': { type: Number, default: 0 },
    'Earnings': { type: Number, default: 0 }
}, { _id: false });

const hourlyBreakdownSchema = new mongoose.Schema({
    'breakdown': {
        type: [ breakdownSchema ],
        default: function () {
            return hourType.map(types => ({ 'Hour Type': types, 'Hours': 0, 'Earnings': 0 }))
        }
    }
});

const payslipSchema = new mongoose.Schema({
    'Employee': {
        'user': { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        'name': String,
        'Paid Out': String,
        'Pay Period': String
    },
    'Earnings': { type: earningsSchema, default: () => ({}) },
    'Contributions & Deductions': { type: contriAndDeductSchema, default: () => ({}) },
    'Allowances': { type: allowanceSchema, default: () => ({}) },
    'Hourly Breakdown': { type: hourlyBreakdownSchema, default: () => ({}) },
    'Totals': {
        'Hours': { type: Number, default: 0 },
        'Net Earnings': { type: Number, default: 0 },
        'Earnings Excluding Performance Bonus': { type: Number, default: 0 }
    },
    'date': { type: Date, default: Date.now }
});

payslipSchema.pre('save', async function (next) {
    const dateToday = new Date();
    const [ payout1, payout2 ] = [ 5, 20];
    const [ yearNow, monthNow, dateNow ] = [ dateToday.getFullYear(), dateToday.getMonth(), dateToday.getDate() ];
    const [ startPeriod1, endPeriod1, startPeriod2, endPeriod2 ] = [ 1, 15, 16, 0];
    // try {
        // first cut off pay
        if (dateNow <= payout1 || dateNow >= payout2) {
            let periodMonth = dateNow > payout2 ? monthNow : monthNow - 1;
            const payoutDate =  new Date(yearNow, periodMonth, payout1)
            const startDate = new Date(yearNow, periodMonth, startPeriod2).toLocaleDateString();
            const endDate = new Date(yearNow, periodMonth + 1, endPeriod2).toLocaleDateString();
            this['Employee']['Paid Out'] = payoutDate.toDateString();
            this['Employee']['Pay Period'] = `${startDate} to ${endDate}`;
        } else {
            // second cut off pay
            const payoutDate =  new Date(yearNow, monthNow, payout2)
            const startDate = new Date(yearNow, monthNow, startPeriod1).toLocaleDateString();
            const endDate = new Date(yearNow, monthNow, endPeriod1).toLocaleDateString();
            this['Employee']['Paid Out'] = payoutDate.toDateString();
            this['Employee']['Pay Period'] = `${startDate} to ${endDate}`;
        }

        // to make an instance for the employee name and its pay date details
        await this.populate('Employee.user');
        const user = this['Employee'].user;
        this['Employee'].name = `${user.firstName} ${user.middleName} ${user.lastName}`;
    next();
    // } catch (error) {
    //     next(error);
    // }
});

module.exports = mongoose.model('Payslip', payslipSchema);