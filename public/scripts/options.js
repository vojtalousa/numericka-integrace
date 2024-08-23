import { draw, graph, options, setAnnotations } from "./chart.js";
import { integrate } from "./integration.js";

const form = document.getElementById('options-form');
const inputs = form.elements;
inputs.function.value = options.fn
inputs.segments.value = options.segments
inputs.method.value = options.integrationMethod
inputs.lower.value = options.limits.lower
inputs.upper.value = options.limits.upper

let limitSideOverride
export const limitDragEnd = () => limitSideOverride = false
export const changeLimit = (defaultId, x, originIsInput = false) => {
    const changeValue = (id, value) => {
        options.limits[id] = value
        const sameValue = x === (id === 'lower' ? options.limits.upper : options.limits.lower)
        const setInput = !originIsInput || (limitSideOverride && !sameValue)
        if (setInput) inputs[id].value = value
        graph(`limit-${id}-handle`).update('points', [[value, 0]])
        graph(`limit-${id}-label`).update('location', [value, 0])
        graph(`limit-${id}-label`).update('text', value.toFixed(2))

    }

    let id = limitSideOverride || defaultId
    if (id === 'lower' && x > options.limits.upper) {
        limitSideOverride = 'upper'
        changeValue('lower', options.limits.upper)
        id = 'upper'
        if (originIsInput) inputs.upper.focus()
    } else if (id === 'upper' && x < options.limits.lower) {
        limitSideOverride = 'lower'
        changeValue('upper', options.limits.lower)
        id = 'lower'
        if (originIsInput) inputs.lower.focus()
    }

    changeValue(id, x)
    setAnnotations([{ x: options.limits.lower }, { x: options.limits.upper }])
}
const changes = {
    segments: (value) => {
        if (parseInt(value) > 100) inputs.segments.setCustomValidity('Visualization disabled')
        else inputs.segments.setCustomValidity('')
        options.segments = parseInt(value)
        inputs.segments.reportValidity()
    },
    method: (value) => options.integrationMethod = value,
    lower: (value) => {
        if (Number.isNaN(parseFloat(value)) || value.endsWith('.')) return
        changeLimit('lower', parseFloat(value), true)
        limitDragEnd()
    },
    upper: (value) => {
        if (Number.isNaN(parseFloat(value)) || value.endsWith('.')) return
        changeLimit('upper', parseFloat(value), true)
        limitDragEnd()
    },
    function: (value) => {
        try {
            const result = functionPlot.$eval.builtIn({ fn: value }, 'fn', { x: 0 })
            if (typeof result !== 'number') throw new Error('Incomplete function')
            graph('function').update('fn', value)
            options.fn = value
            try {
                options.integralFn = mathjs.integrate(value, 'x').toString()
                inputs.function.setCustomValidity('')
            } catch (e) {
                options.integralFn = false
                inputs.function.setCustomValidity('Cannot get exact integral')
            }
        } catch (e) {
            console.log(e)
            inputs.function.setCustomValidity('Invalid function')
        }
        inputs.function.reportValidity()
    },

}
Array.from(inputs).forEach(input => {
    input.addEventListener('input', () => {
        changes[input.name](input.value)
        integrate()
        draw()
    })
})

let optionsOpen = false
const results = document.getElementById('results')
const openOptionsButton = document.getElementById('open-options-button')
openOptionsButton.addEventListener('click', () => {
    if (optionsOpen) openOptionsButton.innerText = 'Open options'
    else openOptionsButton.innerText = 'Close options'
    optionsOpen = !optionsOpen

    form.classList.toggle('open')
    results.classList.toggle('open')
})