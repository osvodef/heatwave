import skmeans from 'skmeans';
import { Bound } from './bound';
import { paletteSize, discrete } from './settings';
import { Sample, Metadata, Range } from './types';

export function calcMetadata(samples: Sample[]): Metadata {
    const values = samples.map((sample) => sample.value);

    const geoBound = new Bound();
    const mapBound = new Bound();

    const valueRange = { min: Infinity, max: -Infinity };

    for (const sample of samples) {
        const { value, geoPoint, mapPoint } = sample;

        geoBound.extend(geoPoint);
        mapBound.extend(mapPoint);

        if (value < valueRange.min) {
            valueRange.min = value;
        }

        if (value > valueRange.max) {
            valueRange.max = value;
        }
    }

    const clusterCount = discrete ? paletteSize : paletteSize - 1;

    const centroids = (skmeans(values, clusterCount).centroids as unknown) as number[];
    const clusters = calcRanges(centroids, valueRange);

    return { clusters, geoBound, mapBound };
}

function calcRanges(centroids: number[], valueRange: Range): Range[] {
    centroids.sort((a, b) => a - b);

    const result: Range[] = [];

    for (let i = 0; i < centroids.length; i++) {
        const isFirst = i === 0;
        const isLast = i === centroids.length - 1;

        result.push({
            min: !isFirst ? (centroids[i - 1] + centroids[i]) / 2 : valueRange.min,
            max: !isLast ? (centroids[i] + centroids[i + 1]) / 2 : valueRange.max,
        });
    }

    return result;
}
