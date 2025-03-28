import mathjs from '/dist/math-js-integral.js'

export const options = {
    fn: 'x^3 + 2x^2 - 3x + 1',
    segments: 2,
    integrationMethod: 'midpoint',
    limits: {
        lower: -2,
        upper: 2
    },
    visualizationLimit: 100,
}
options.integralFn = mathjs.integrate(options.fn, 'x').toString()

const limitChartOptions = (id) => {
    const value = options.limits[id]
    return [
        {
            fnType: 'points',
            attr: {
                id: `limit-${id}-handle`,
                class: 'limit-handle',
                r: 7,
            },
            points: [[value, 0]],
            graphType: 'scatter'
        },
        {
            graphType: 'text',
            attr: {
                id: `limit-${id}-label`,
                class: 'limit-label',
                dy: 20,
            },
            background: {
                enabled: true,
                attr: { rx: 7, class: 'limit-label-background' },
                margin: { x: 8, y: 4 }
            },
            location: [value, 0],
            text: value.toFixed(2)
        }
    ]
}

const chartData = [
    {
        fnType: 'points',
        graphType: 'polyline',
        attr: { id: 'integral-odd' },
        points: []
    },
    {
        fnType: 'points',
        graphType: 'polyline',
        attr: { id: 'integral-even' },
        points: []
    },
    {
        graphType: 'polyline',
        fn: options.fn,
        attr: { id: 'function' }
    },
    {
        fnType: 'points',
        attr: { id: 'touch-points', r: 4 },
        points: [],
        graphType: 'scatter'
    },
    ...limitChartOptions('lower'),
    ...limitChartOptions('upper')
]

const chartOptions = {
    width: window.innerWidth,
    height: window.innerHeight,
    target: '#chart',
    grid: true,
    fullscreen: true,
    x: { position: 'sticky' },
    y: { position: 'sticky' },
    tip: { xLine: true, yLine: true },
    annotations: [
        { x: options.limits.lower },
        { x: options.limits.upper }
    ],
    data: chartData
}

export const fnEval = (x) => {
    const result = functionPlot.$eval.builtIn({ fn: options.fn }, 'fn', { x }) || 0
    if (Number.isNaN(result)) return 0
    else if (result === Infinity) return Number.MAX_SAFE_INTEGER
    else if (result === -Infinity) return Number.MIN_SAFE_INTEGER
    return result
}
export const chart = functionPlot(chartOptions);
export const draw = () => {
    chart.options = chartOptions
    chart.draw()
}
export const setAnnotations = (annotations) => chartOptions.annotations = annotations
export const setDomain = (xDomain, yDomain) => {
    chartOptions.x.domain = xDomain
    chartOptions.y.domain = yDomain
    chart.meta.zoomBehavior.xScale.domain(xDomain)
    chart.meta.zoomBehavior.yScale.domain(yDomain)
    chart.build()
}
export const setInteraction = (enabled) => {
    chartOptions.disableZoom = !enabled
    chart.build()
}
export const graph = (id) => {
    const index = chartOptions.data.findIndex(d => d.attr.id === id)
    if (index === -1) throw new Error(`Graph with id ${id} not found`)

    return {
        get: () => chartOptions.data[index],
        set: (value) => chartOptions.data[index] = value,
        update: (key, value) => chartOptions.data[index][key] = value,
        remove: () => chartOptions.data.splice(index, 1)
    }
}
draw()
// wait for the handle label font to load so the background can be sized correctly
document.fonts.ready.then(draw)