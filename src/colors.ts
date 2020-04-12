import { Palette, RGB, d3ColorScale, Range } from './types';
import * as d3 from 'd3-scale-chromatic';

export function createPalette(
    d3ScaleName: d3ColorScale,
    size: number,
    gamma: number,
    reverse: boolean,
): Palette {
    const result: RGB[] = [];

    for (let i = 0; i < size; i++) {
        let t = i / (size - 1);

        if (gamma !== 1) {
            t = (Math.pow(gamma, t) - 1) / (gamma - 1);
        }

        if (reverse) {
            t = 1 - t;
        }

        const color = d3[d3ScaleName](t);
        const rgb = color[0] === '#' ? hexToRgb(color) : stringToRgb(color);

        result.push(rgb);
    }

    return result;
}

export function getColorFromPalette(
    palette: Palette,
    clusters: Range[],
    value: number,
    discrete: boolean,
): RGB {
    if (value < clusters[0].min) {
        return palette[0];
    }

    if (value > clusters[clusters.length - 1].max) {
        return palette[palette.length - 1];
    }

    let clusterIndex = 0;
    while (value < clusters[clusterIndex].min || value > clusters[clusterIndex].max) {
        clusterIndex++;
    }

    if (discrete) {
        return palette[clusterIndex];
    }

    const cluster = clusters[clusterIndex];
    const color1 = palette[clusterIndex];
    const color2 = palette[clusterIndex + 1];
    const ratio = (value - cluster.min) / (cluster.max - cluster.min);

    return [
        color1[0] * (1 - ratio) + color2[0] * ratio,
        color1[1] * (1 - ratio) + color2[1] * ratio,
        color1[2] * (1 - ratio) + color2[2] * ratio,
    ];
}

export function hexToRgb(hex: string): RGB {
    return [
        parseInt(hex.slice(1, 3), 16),
        parseInt(hex.slice(3, 5), 16),
        parseInt(hex.slice(5, 7), 16),
    ];
}

export function stringToRgb(color: string): RGB {
    const split = color.slice(4, -1).split(',');
    return [Number(split[0]), Number(split[1]), Number(split[2])];
}

export function rgbToInt(rgb: RGB): number {
    return (rgb[0] << 24) | (rgb[1] << 16) | (rgb[2] << 8) | 0xff;
}
