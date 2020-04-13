import Jimp from 'jimp';
import KDBush from 'kdbush';
import { getColorFromPalette, rgbToInt } from './colors';
import { radius, tileSizePx, discrete, power } from './settings';
import { tileCoordsToMapPoint, tileZoomToSize } from './geo';
import { Sample, TileCoords, Metadata, Point, Palette } from './types';

/**
 * Генерит один тайл хитмапа. Исполняется в воркере.
 */
module.exports = function generateTile(
    samples: Sample[],
    coords: TileCoords,
    metadata: Metadata,
    palette: Palette,
    callback: () => void,
): void {
    // Сюда будут записаны цвета пикселей.
    const result = new Uint32Array(tileSizePx * tileSizePx);

    // Мап-координаты левого верхнего угла тайла.
    const tilePoint = tileCoordsToMapPoint(coords);

    // Размер тайла в мап-координатах.
    const tileSizeMap = tileZoomToSize(coords[2]);

    // Точки в этих пределах будут влиять на текущий тайл. Все остальные можно отобросить.
    const minX = tilePoint[0] - radius;
    const maxX = tilePoint[0] + tileSizeMap + radius;
    const minY = tilePoint[1] - radius;
    const maxY = tilePoint[1] + tileSizeMap + radius;

    // Оставляем только те точки, которые влияют на текущий тайл.
    samples = samples.filter((sample) => {
        const x = sample.mapPoint[0];
        const y = sample.mapPoint[1];

        return x > minX && x < maxX && y > minY && y < maxY;
    });

    // Строим kd-дерево для точек.
    const tree = new KDBush<Point>(samples.map((sample) => sample.mapPoint));

    for (let i = 0; i < tileSizePx; i++) {
        const x = tilePoint[0] + (i / tileSizePx) * tileSizeMap;

        for (let j = 0; j < tileSizePx; j++) {
            const y = tilePoint[1] + (j / tileSizePx) * tileSizeMap;

            // Список точек, влияющих на текущий пиксель.
            const neighborIndices = tree.within(x, y, radius);

            // Пиксель далеко от всех точек — пропишем в него прозрачный цвет.
            if (neighborIndices.length === 0) {
                result[j * tileSizePx + i] = 0x00000000;
                continue;
            }

            // Вычисляем взвешенное среднее. Проходим в цикле по точкам и вычисляем
            // числитель и знаменатель среднего.
            let numerator = 0;
            let denominator = 0;
            for (const index of neighborIndices) {
                const sample = samples[index];
                const mapPoint = sample.mapPoint;

                const dx = x - mapPoint[0];
                const dy = y - mapPoint[1];

                const distanceSquared = dx * dx + dy * dy;
                const distancePowered =
                    (power as number) === 2
                        ? distanceSquared
                        : Math.pow(distanceSquared, power / 2);

                const weight = 1 / distancePowered;

                numerator += weight * sample.value;
                denominator += weight;
            }

            const avg = numerator / denominator;

            // Прописываем полученный цвет в пиксель.
            result[j * tileSizePx + i] = rgbToInt(
                getColorFromPalette(palette, metadata.clusters, avg, discrete),
            );
        }
    }

    // Сохраняем PNG-шку на диск.
    Jimp.create(tileSizePx, tileSizePx).then((image) => {
        for (let i = 0; i < tileSizePx; i++) {
            for (let j = 0; j < tileSizePx; j++) {
                image.setPixelColor(result[j * tileSizePx + i], i, j);
            }
        }

        image.write(`dist/tiles/${coords[2]}_${coords[0]}_${coords[1]}.png`);

        callback();
    });
};
