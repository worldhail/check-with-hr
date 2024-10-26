import morgan from 'morgan';
import logger from '../config/logger.js';

export default morgan('tiny', {
    stream: {
        write: (message) => logger.info(message.trim())
    }
});