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
    'user': { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
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

const Payslip = mongoose.model('Payslip', payslipSchema);

module.exports = {
    hourType,
    Payslip,
}