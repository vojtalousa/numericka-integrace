import computeGaussAbscissas from "./gauss.js";

export default (fnEval) => ({
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
            approximation += (segmentWidth / 6) * (leftY + 4 * middleY + rightY)
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
    },
    // tanhsinh: (limits, segments, _, doVisualization) => {
    //     let approximation = 0
    //     const vertices = { odd: [], even: [] }
    //     const touchPoints = []
    //     const h = 0.05
    //     for (let i = -segments; i <= segments; i++) {
    //         const x = Math.tanh((Math.PI / 2) * Math.sinh(h * i))
    //         const w = h * (Math.PI / 2) * (Math.cosh(h * i) / ((Math.cosh((Math.PI / 2) * Math.sinh(h * i))) ** 2))
    //         const xAdjusted = x
    //         // const xAdjusted = (((limits.upper - limits.lower) / 2) * x) + ((limits.upper + limits.lower) / 2)
    //         const y = fnEval(xAdjusted)
    //         approximation += w * y
    //         // console.log(i, x, w, xAdjusted, y, approximation)
    //
    //         if (doVisualization) {
    //             touchPoints.push([xAdjusted, y])
    //             // const width = h * ((limits.upper - limits.lower) / 2)
    //             const width = h
    //             const leftX = xAdjusted - width / 2
    //             const rightX = xAdjusted + width / 2
    //             const newVertices = [
    //                 [leftX, 0],
    //                 [leftX, y],
    //                 [rightX, y],
    //                 [rightX, 0],
    //             ]
    //             if (i % 2 === 0) vertices.even.push(...newVertices)
    //             else vertices.odd.push(...newVertices)
    //         }
    //     }
    //     console.log(approximation)
    //     // approximation *= ((limits.upper - limits.lower) / 2) * h
    //     // approximation *= h
    //     if (!doVisualization) return { approximation }
    //     const integral = (id) => ({
    //         fnType: 'points',
    //         attr: { id: `integral-${id}`, class: 'gauss' },
    //         points: vertices[id].length > 0 ? [...vertices[id], vertices[id][0]] : [],
    //         graphType: 'polyline'
    //     })
    //     return { integral, touchPoints, approximation }
    // },
    montecarlo: (limits, segments, _, doVisualization) => {
        let average = 0
        const touchPoints = []
        for (let i = 0; i < segments; i++) {
            const x = limits.lower + Math.random() * (limits.upper - limits.lower)
            const y = fnEval(x)
            average += y
            if (doVisualization) {
                touchPoints.push([x, y])
            }
        }
        average /= segments
        const approximation = (limits.upper - limits.lower) * average
        if (!doVisualization) return { approximation }
        const integral = (id) => ({
            fnType: 'points',
            attr: { id: `integral-${id}`, class: 'gauss' },
            points: [
                [limits.lower, 0],
                [limits.lower, average],
                [limits.upper, average],
                [limits.upper, 0]
            ],
            graphType: 'polyline'
        })
        return { integral, touchPoints, approximation }
    },
})