import vega from 'vega';
import fs from 'fs/promises';

export default async (title, tables) => {
    const spec = {
        $schema: 'https://vega.github.io/schema/vega/v5.json',
        width: 1600,
        height: 800,
        padding: 10,
        data: tables,
        background: 'white',
        scales: [
            {
                name: 'xscale',
                type: 'linear',
                range: 'width',
                domain: {
                    fields: tables.map(({ name }) => ({ data: name, field: 'x' }))
                }
            },
            {
                name: 'yscale',
                type: 'log',
                range: 'height',
                domain: {
                    fields: tables.map(({ name }) => ({ data: name, field: 'y' }))
                }
            }
        ],
        axes: [
            {
                orient: 'bottom', scale: 'xscale',
                title: 'Počet využitých uzlů',
                labelFontSize: 25, titleFontSize: 25
            },
            {
                orient: 'left', scale: 'yscale',
                title: 'Relativní chyba',
                labelFontSize: 25, titleFontSize: 25
            }
        ],
        marks: [
            ...tables.flatMap(({ name, color }, index) => [
                {
                    type: 'line',
                    from: { data: name },
                    encode: {
                        enter: {
                            x: { scale: 'xscale', field: 'x' },
                            y: { scale: 'yscale', field: 'y' },
                            stroke: { value: color },
                        }
                    }
                },
                {
                    type: 'text',
                    encode: {
                        enter: {
                            text: { value: name },
                            fill: { value: color },
                            x: { value: 1640 },
                            y: { value: 40 + 40 * index },
                            fontSize: { value: 25 }
                        }
                    }
                }
            ]),
            {
                type: 'text',
                encode: {
                    enter: {
                        text: { value: title },
                        x: { value: 800 },
                        y: { value: 40 },
                        fontSize: 20
                    }
                }
            }
        ]
    }


    const view = new vega.View(vega.parse(spec))
    view.renderer('none')
    view.initialize();

    const canvas = await view.toCanvas()
    const strippedTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    await fs.writeFile(`results/${strippedTitle}.png`, canvas.toBuffer());
}