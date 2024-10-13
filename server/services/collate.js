import User from '../models/user.js';
import removeDuplicates from '../utils/removeDuplicates.js';
import ClientError from './customError.js';

export default async function (input) {
    // Searches every key pairs to ensure documents are retrieved
    const queries = [];
    for (let keys in input) {
        queries.push(User.find({ [keys]: input[keys] })
            .select('employeeID firstName middleName lastName department hireDate employmentStatus')
            .collation({ locale: 'en', strength: 2 }));
    };

    if (queries.length === 0) throw new ClientError(400, 'No search parameters setup');

    // making sure every key pair document results must not be duplicated
    const combinedDocuments = (await Promise.all(queries)).flat();
    
    const documentResults = removeDuplicates(combinedDocuments);
    return documentResults;
};