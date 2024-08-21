export const options = {
    fn: 'x^3 + 2x^2 - 3x + 1',
    segments: 2,
    integrationMethod: 'midpoint',
    limits: {
        lower: -2,
        upper: 2
    }
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

export const fnEval = (x) => functionPlot.$eval.builtIn({ fn: options.fn }, 'fn', { x })
export const chart = functionPlot(chartOptions);
export const draw = () => functionPlot(chartOptions)
export const setAnnotations = (annotations) => chartOptions.annotations = annotations
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