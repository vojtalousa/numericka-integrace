const fn = 'x^2'
functionPlot({
    width: window.innerWidth,
    height: window.innerHeight,
    target: '#graph',
    grid: true,
    fullscreen: false,
    data: [
        {
            graphType: 'polyline',
            fn,
            attr: {
                id: 'function',
            }
        },
    ],
    x: {
        position: 'sticky'
    },
    y: {
        position: 'sticky'
    },
    tip: {
        xLine: true,
        yLine: true
    },
})