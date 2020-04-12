import Jimp from 'jimp';
import { getColorFromPalette, rgbToInt } from './colors';
import { radius, tileSizePx, discrete } from './settings';
import { tileCoordsToMapPoint, tileZoomToSize } from './geo';
import { Sample, TileCoords, Metadata, Point, Palette } from './types';

export function generateTile(
    samples: Sample[],
    tree: KDBush<Point>,
    coords: TileCoords,
    metadata: Metadata,
    palette: Palette,
): void {
    const result = new Uint32Array(tileSizePx * tileSizePx);

    const tilePoint = tileCoordsToMapPoint(coords);
    const tileSizeMap = tileZoomToSize(coords[2]);

    for (let i = 0; i < tileSizePx; i++) {
        const x = tilePoint[0] + (i / tileSizePx) * tileSizeMap;

        for (let j = 0; j < tileSizePx; j++) {
            const y = tilePoint[1] + (j / tileSizePx) * tileSizeMap;

            const neighborIndices = tree.within(x, y, radius);

            if (neighborIndices.length === 0) {
                result[j * tileSizePx + i] = 0x00000000;
                continue;
            }

            let numerator = 0;
            let denominator = 0;

            for (const index of neighborIndices) {
                const sample = samples[index];
                const mapPoint = sample.mapPoint;

                const distanceSquared =
                    (x - mapPoint[0]) * (x - mapPoint[0]) + (y - mapPoint[1]) * (y - mapPoint[1]);

                const weight = 1 / distanceSquared;

                numerator += weight * sample.value;
                denominator += weight;
            }

            const avg = numerator / denominator;

            result[j * tileSizePx + i] = rgbToInt(
                getColorFromPalette(palette, metadata.clusters, avg, discrete),
            );
        }
    }

    Jimp.create(tileSizePx, tileSizePx).then((image) => {
        for (let i = 0; i < tileSizePx; i++) {
            for (let j = 0; j < tileSizePx; j++) {
                image.setPixelColor(result[j * tileSizePx + i], i, j);
            }
        }

        image.write(`dist/tiles/${coords[2]}_${coords[0]}_${coords[1]}.png`);
    });
}
