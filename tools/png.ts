import { Resvg } from '@resvg/resvg-js';

export async function generatePng(svg: string, width: number) {
  return new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    background: 'rgba(0,0,0,0)',
  })
    .render()
    .asPng();
}
