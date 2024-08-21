import { chart, draw } from './chart.js'
import { changeLimit, limitDragEnd } from './options.js'
import { integrate } from './integration.js'

let mousedown = false
let dragElement = null
const down = (event) => {
    mousedown = true
    dragElement = event.target
}
const up = () => {
    mousedown = false
    limitDragEnd()
}
const graphsNode = document.querySelector('.content')
const bounds = graphsNode.getBoundingClientRect()
const offsetX = bounds.left
const move = (event) => {
    if (mousedown) {
        if (!['limit-lower-handle', 'limit-upper-handle'].includes(dragElement.id)) return
        const x = chart.meta.xScale.invert(event.x - offsetX);
        changeLimit(dragElement.id.split('-')[1], x)
        integrate()
        draw()
    }
}
document.addEventListener('mousedown', down)
document.addEventListener('touchstart', (event) => {
    down(event)
    // required because the plotting library removes the target element after it's changed thus breaking the touchmove/end listeners
    event.target.addEventListener('touchmove', (event) => {
        move({ ...event, x: event.touches[0].pageX })
    })
    event.target.addEventListener('touchend', () => {
        event.target.removeEventListener('touchmove', move)
        event.target.removeEventListener('touchend', up)
        up()
    })
})
document.addEventListener('mouseup', up)
document.addEventListener('mousemove', move)