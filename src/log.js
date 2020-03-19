
const NODE_ENV = process.env.NODE_ENV;

const isNotProd = NODE_ENV !== 'production';

function shouldLog(level) {
    return isNotProd && console[level];
}

export default function log(level, ...msgs) {
    if (shouldLog(level)) {
        console[level](...msgs);
    }
}
