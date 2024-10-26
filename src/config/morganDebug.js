import morgan from 'morgan';
import debug from 'debug';
const debugMorgan = debug('app:morgan');

export default morgan('tiny', {
    stream: {
        write: (message) => debugMorgan(message.trim())
    }
});