import { draw, graph, options, fnEval } from "./chart.js";
import mathjs from '/dist/math-js-integral.js'
import getMethods from '/dist/integration-methods.js'

const integrationMethods = getMethods(fnEval)

const errorElement = document.getElementById('error')
const resultElement = document.getElementById('result')
const approximationElement = document.getElementById('approximation')
const convertScientific = (number) => {
    if (number.includes('e')) {
        const [mantissa, exponent] = number.split('e')
        return `${mantissa}⋅10<sup>${exponent.replace('+', '')}</sup>`
    }
    return number
}
export const integrate = () => {
    const segmentWidth = (options.limits.upper - options.limits.lower) / options.segments
    const doVisualization = options.segments <= options.visualizationLimit
    const getResults = integrationMethods[options.integrationMethod]
    const args = [options.limits, options.segments, segmentWidth, doVisualization]
    const { integral, touchPoints, approximation } = getResults(...args)

    if (doVisualization) {
        graph('integral-odd').set(integral('odd'))
        graph('integral-even').set(integral('even'))
        graph('touch-points').update('points', touchPoints)
    } else {
        graph('integral-odd').set({
            fnType: 'points',
            graphType: 'polyline',
            attr: { id: 'integral-odd' },
            points: []
        })
        graph('integral-even').set({
            graphType: 'polyline',
            fnType: 'linear',
            attr: { id: `integral-even` },
            fn: options.fn,
            range: [options.limits.lower, options.limits.upper],
            closed: true,
        })
        graph('touch-points').update('points', [])
        draw()
    }
    approximationElement.innerText = approximation

    if (options.integralFn === false) {
        resultElement.innerText = 'N/A'
        errorElement.innerText = 'N/A'
        return
    }
    const integralLeft = mathjs.evaluate(options.integralFn, { x: options.limits.lower })
    const integralRight = mathjs.evaluate(options.integralFn, { x: options.limits.upper })
    const exactIntegral = integralRight - integralLeft
    const percentageError = (Math.abs(exactIntegral - approximation) / Math.abs(exactIntegral)) * 100
    resultElement.innerText = `${exactIntegral}`
    errorElement.innerHTML = `${convertScientific((percentageError || 0).toPrecision(3))}%`
}

integrate()
draw()