import { select as d3Select, Selection } from 'd3-selection'
import { hsl as d3Hsl } from 'd3-color'

import { color } from '../utils.mjs'

import { Chart } from '../index.js'
import { FunctionPlotDatum } from '../types.js'

export default function Text(chart: Chart) {
  const xScale = chart.meta.xScale
  const yScale = chart.meta.yScale

  function text(selection: Selection<any, FunctionPlotDatum, any, any>) {
    selection.each(function (d) {
      // Force some parameters to make it look like a vector.
      d.sampler = 'builtIn'
      d.fnType = 'vector'

      const innerSelection = d3Select(this).selectAll(':scope > text.fn-text').data([d.location])
      const innerSelectionEnter = innerSelection.enter().append('text').attr('class', `fn-text fn-text-${d.index}`)

      const computeColor = color(d, d.index)

      // enter + update
      const selection = innerSelection
        .merge(innerSelectionEnter)
        .attr('fill', d3Hsl(computeColor.toString()).brighter(1.5).formatHex())
        .attr('x', (d) => xScale(d[0]))
        .attr('y', (d) => yScale(d[1]))
        .text(() => d.text)

      if (d.attr) {
        for (const k in d.attr) {
          selection.attr(k, d.attr[k])
        }
      }

      if (d.background?.enabled) {
        const innerBackground = d3Select(this).selectAll(':scope > rect.fn-text-background').data([d.location])
        const innerBackgroundEnter = innerBackground.enter().append('rect').lower().attr('class', `fn-text-background fn-text-background-${d.index}`)

        const text = d3Select(this).select('text.fn-text')
        const { x, y, width, height } = text.node().getBBox()

        const background = innerBackground
          .merge(innerBackgroundEnter)
          .attr('x', x - (d.background.margin?.x || 0))
          .attr('y', y - (d.background.margin?.y || 0))
          .attr('width', width + ((d.background.margin?.x * 2) || 0))
          .attr('height', height + ((d.background.margin?.y * 2) || 0))
          .attr('fill', 'white')
          .attr('fill-opacity', 0.8)
          .attr('stroke', 'black')

        if (d.background.attr) {
          for (const k in d.background.attr) {
            background.attr(k, d.background.attr[k])
          }
        }

        background.exit().remove()
      }

      // exit
      innerSelection.exit().remove()
    })
  }

  return text
}
