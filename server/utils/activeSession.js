import debug from 'debug';
const debugError = debug('app:error');

export default (error, message) => {
    if (error) {
        debugError('Error destroying session:', error);
        throw new Error(message);
    }
}