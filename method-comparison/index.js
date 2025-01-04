import getMethods from '../methods/index.js'
import draw from "./draw.js";

const conversion = {
    midpoint: (x) => x,
    trapezoidal: (x) => x - 1,
    simpsons: (x) => Math.floor((x - 1) / 2),
    gauss: (x) => x,
    montecarlo: (x) => x
}

const tests = [
    {fn: (x) => Math.cos(x), limits: {lower: 0, upper: 1}, expected: 0.841470984807896507, name: 'f(x)=cos(x)'},
    {fn: (x) => Math.sin(100 * x), limits: {lower: 0, upper: 1}, expected: 0.00137681127712316066, name: 'f(x)=sin(100x)'},
    {fn: (x) => Math.sin(1/x), limits: {lower: 0, upper: 1}, expected: 0.504067061906928372, name: 'f(x)=sin(1/x)'},
    {fn: (x) => Math.sqrt(1 - x ** 2), limits: {lower: -1, upper: 1}, expected: 1.570796326794896619, name: 'f(x)=sqrt(1-x^2)'},
    {fn: (x) => Math.exp(-x), limits: {lower: -1, upper: 1}, expected: 2.35040238728760291, name: 'f(x)=exp(-x)'},
    {fn: (x) => 1/(x**2 - 1), limits: {lower: 0, upper: 2.1}, expected: -11.86479509460322768662306754, name: 'f(x)=1/(x^2-1)'},
]

const fixBadNumber = (fn) => (x) => {
    const result = fn(x)
    if (Number.isNaN(result)) return 0
    else if (result === Infinity) return Number.MAX_SAFE_INTEGER
    else if (result === -Infinity) return Number.MIN_SAFE_INTEGER
    return result
}

for (const test of tests) {
    const results = {}
    const integrationMethods = getMethods(fixBadNumber(test.fn))
    for (const method in integrationMethods) {
        results[method] = []
        for (let usedPoints = 1; usedPoints <= 801; usedPoints += 2) {
            const segments = conversion[method](usedPoints)
            const segmentWidth = (test.limits.upper - test.limits.lower) / segments
            const args = [test.limits, segments, segmentWidth, false]
            const {approximation} = integrationMethods[method](...args)
            const error = Math.abs(test.expected - approximation) / Math.abs(test.expected)
            results[method].push(error)
        }
    }

    const colors = ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#915DD0', '#D0C65D'];
    const tables = Object.entries(results).map(([method, errors]) => ({
        name: method,
        values: errors.map((error, i) => ({x: i + 1, y: error})),
        color: colors.shift()
    }));

    await draw(test.name, tables)
}