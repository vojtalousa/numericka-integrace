const fn = 'x^2'
const chart = functionPlot({
    width: window.innerWidth,
    height: window.innerHeight,
    target: '#graph',
    grid: true,
    fullscreen: true,
    data: [
        {
            graphType: 'polyline',
            fn,
            attr: {
                id: 'function',
            }
        },
        {
            graphType: 'text',
            attr: {
                id: 'limit-right-label',
                class: 'limit-label',
                dy: 15,
            },
            location: [-2, 0],
            text: -2,
            background: {
                enabled: true,
                attr: {
                    fill: 'red',
                    stroke: 'none',
                    rx: 5,
                    style: 'filter: drop-shadow( 3px 3px 2px rgba(0, 0, 0, .7));'
                },
                margin: {
                    x: 5,
                    y: 5
                }
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