// NPM PACKAGES
import debug from 'debug';
const debugAdmin = debug('app:admin');

// CUSTOMER MODULES/MIDDLEWARES
import collate from '../services/collate.js';
import setLeaveCredits from '../services/setLeaveCredits.js';
import getLeaveCredits from '../services/getLeaveCredits.js';
import calculateCreditDifference from '../services/calculateCreditDifference.js';
import updateCredits from '../services/updateCredits.js';

// GET EMPLOYEE DOCUMENTS
export const userDocuments = async (req, res) => {
    const documents = await collate(req.body);
    debugAdmin('Matching documents returned');
    res.send(documents);
};

export const createLeaveCredits = async (req, res) => {
    const id = req.params.id;
    
    const userCredits = await setLeaveCredits(id, req.body);

    debugAdmin('New leave credits setup');
    res.status(201).send(userCredits);
};

export const updateLeaveCredits = async (req, res) => {
    const id = req.params.id;
    const numberOfLeave = req.body.available;
    
    const credits = await getLeaveCredits(id);
    if (!credits) return res.status(400).send('No user credits found');

    debugAdmin('Caculating credit difference');
    const creditDifference = calculateCreditDifference(credits, numberOfLeave);
    
    const newCredits = await updateCredits(id, creditDifference);
    debugAdmin('Leave credits updated', newCredits);
    res.send(newCredits);
};