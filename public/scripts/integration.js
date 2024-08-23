import { draw, graph, options, fnEval } from "./chart.js";
import computeGaussAbscissas from "./gauss.js";

const integration = {
    midpoint: (limits, segments, segmentWidth, doVisualization) => {
        const vertices = { odd: [], even: [] }
        const touchPoints = []
        let approximation = 0
        for (let i = 0; i < segments; i++) {
            const x = limits.lower + i * segmentWidth + segmentWidth / 2
            const y = fnEval(x)
            approximation += segmentWidth * y
            if (doVisualization) {
                touchPoints.push([x, y])
                const newVertices = [
                    [x - segmentWidth / 2, 0],
                    [x - segmentWidth / 2, y],
                    [x + segmentWidth / 2, y],
                    [x + segmentWidth / 2, 0],
                ]
                if (i % 2 === 0) vertices.even.push(...newVertices)
                else vertices.odd.push(...newVertices)
            }
        }

        if (!doVisualization) return { approximation }

        const integral = (id) => ({
            fnType: 'points',
            attr: { id: `integral-${id}`, class: 'midpoint' },
            points: vertices[id].length > 0 ? [...vertices[id], vertices[id][0]] : [],
            graphType: 'polyline'
        })
        return { integral, touchPoints, approximation }
    },
    trapezoidal: (limits, segments, segmentWidth, doVisualization) => {
        const vertices = { odd: [], even: [] }
        const touchPoints = []
        let approximation = 0
        for (let i = 0; i < segments; i++) {
            const leftX = limits.lower + i * segmentWidth
            const rightX = leftX + segmentWidth
            const leftY = fnEval(leftX)
            const rightY = fnEval(rightX)
            approximation += segmentWidth / 2 * (leftY + rightY)
            if (doVisualization) {
                touchPoints.push([leftX, leftY])
                const newVertices = [
                    [leftX, 0],
                    [leftX, leftY],
                    [rightX, rightY],
                    [rightX, 0],
                ]
                if (i % 2 === 0) vertices.even.push(...newVertices)
                else vertices.odd.push(...newVertices)
            }
        }

        if (!doVisualization) return { approximation }
        touchPoints.push([limits.upper, fnEval(limits.upper)])
        const integral = (id) => ({
            fnType: 'points',
            attr: { id: `integral-${id}`, class: 'trapezoidal' },
            points: vertices[id].length > 0 ? [...vertices[id], vertices[id][0]] : [],
            graphType: 'polyline'
        })
        return { integral, touchPoints, approximation }
    },
    simpsons: (limits, segments, segmentWidth, doVisualization) => {
        let approximation = 0
        const touchPoints = []
        for (let i = 0; i < segments; i++) {
            const leftX = limits.lower + i * segmentWidth
            const rightX = leftX + segmentWidth
            const middleX = (leftX + rightX) / 2
            const leftY = fnEval(leftX)
            const middleY = fnEval(middleX)
            const rightY = fnEval(rightX)
            approximation += segmentWidth / 6 * (leftY + 4 * middleY + rightY)
            if (doVisualization) {
                touchPoints.push([leftX, leftY])
                touchPoints.push([middleX, middleY])
            }
        }

        if (!doVisualization) return { approximation }
        touchPoints.push([limits.upper, fnEval(limits.upper)])
        const simpsonsFunctions = Array(segments).fill().map((_, i) => {
            const halfInterval = segmentWidth / 2
            const leftX = limits.lower + i * segmentWidth
            const rightX = leftX + segmentWidth
            const middleX = (leftX + rightX) / 2

            const a = (fnEval(leftX) - 2 * fnEval(middleX) + fnEval(rightX)) / (2 * halfInterval ** 2);
            const b = (fnEval(rightX) - fnEval(leftX)) / (2 * halfInterval);
            const c = fnEval(middleX)
            return (x) => a * (x - middleX) ** 2 + b * (x - middleX) + c
        })
        const getPiecewise = (visibleWhenEven = true) => ({ x }) => {
            const segmentWidth = (limits.upper - limits.lower) / segments
            const functionIndex = Math.floor((x - limits.lower) / segmentWidth)
            const isEven = functionIndex % 2 === 0
            const simpsonsFn = simpsonsFunctions[functionIndex]
            if (simpsonsFn && (visibleWhenEven ? isEven : !isEven)) return simpsonsFn(x)
            return 0
        }
        const integral = (id) => ({
            graphType: 'polyline',
            fnType: 'linear',
            attr: { id: `integral-${id}`,  class: 'simpsons' },
            fn: getPiecewise(id === 'even'),
            range: [limits.lower, limits.upper],
            closed: true,
        })
        return { integral, touchPoints, approximation }
    },
    gauss: (limits, segments, _, doVisualization) => {
        const { x, w } = computeGaussAbscissas(segments, limits.lower, limits.upper)
        let approximation = 0
        const vertices = { odd: [], even: [] }
        const touchPoints = []
        for (let i = 0; i < segments; i++) {
            const y = fnEval(x[i])
            approximation += w[i] * y

            if (doVisualization) {
                touchPoints.push([x[i], y])
                const width = w[i]
                const leftX = x[i] - width / 2
                const rightX = x[i] + width / 2
                const newVertices = [
                    [leftX, 0],
                    [leftX, y],
                    [rightX, y],
                    [rightX, 0],
                ]
                if (i % 2 === 0) vertices.even.push(...newVertices)
                else vertices.odd.push(...newVertices)
            }
        }

        if (!doVisualization) return { approximation }
        const integral = (id) => ({
            fnType: 'points',
            attr: { id: `integral-${id}`, class: 'gauss' },
            points: vertices[id].length > 0 ? [...vertices[id], vertices[id][0]] : [],
            graphType: 'polyline'
        })
        return { integral, touchPoints, approximation }
    }
}

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
    const doVisualization = options.segments <= 100
    const getResults = integration[options.integrationMethod]
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
    const percentageError = ((exactIntegral - approximation) / exactIntegral * 100) || 0
    resultElement.innerText = `${exactIntegral}`
    errorElement.innerHTML = `${convertScientific(percentageError.toPrecision(3))}%`
}

integrate()
draw()