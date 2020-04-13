import * as fs from 'fs';

import * as path from 'path';
import farm from 'worker-farm';
import parse from 'csv-parse/lib/sync';
import { Sample, Point } from './types';
import { createPalette } from './colors';
import { calcMetadata } from './metadata';
import { generatePreviewHtml } from './html';
import { projectGeoToMap, calcTileList } from './geo';
import { dataFile, zoomRange, colorScale, paletteSize, gamma, reverse } from './settings';

const workers = farm(require.resolve('./generate'));

// Загружаем и парсим CSV.
const csv = fs.readFileSync(path.join(__dirname, '..', 'data', dataFile), 'utf8');
const samples: Sample[] = parse(csv, { columns: true }).map((record: any) => {
    const geoPoint: Point = [Number(record['Longitude']), Number(record['Latitude'])];
    const mapPoint = projectGeoToMap(geoPoint);
    const value = Number(record['Value']);

    return { value, geoPoint, mapPoint };
});

// Вычисляем метаданные.
const metadata = calcMetadata(samples);

// Получаем список тайлов для генерации.
const tileList = calcTileList(metadata.mapBound, zoomRange);

// Генерим палитру по параметрам.
const palette = createPalette(colorScale, paletteSize, gamma, reverse);

// Генерим превью-страницу.
const html = generatePreviewHtml(metadata, palette);

console.log(`Starting tile generation. Tiles to generate: ${tileList.length}.\n`);

const startTime = Date.now();
let generatedTileCount = 0;

for (const coords of tileList) {
    // Раскидываем по воркерам задачи на генерацию тайлов.
    workers(samples, coords, metadata, palette, () => {
        generatedTileCount++;

        const progress = formatPercent((generatedTileCount / tileList.length) * 100);

        console.log(`* [${progress}%] Tile [${coords[0]}, ${coords[1]}, ${coords[2]}] ready.`);

        if (generatedTileCount === tileList.length) {
            console.log(
                `\nTile generation successful. Total time: ${(Date.now() - startTime) / 1000}s.`,
            );

            farm.end(workers);
        }
    });
}

fs.writeFileSync(path.join(__dirname, '..', 'dist', 'index.html'), html, 'utf8');

function formatPercent(value: number): string {
    value = Math.round(value * 10) / 10;

    const string = value.toFixed(1);

    return value < 10 ? ` ${string}` : string;
}
