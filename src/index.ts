import * as fs from 'fs';
import KDBush from 'kdbush';
import * as path from 'path';
import parse from 'csv-parse/lib/sync';
import { Sample, Point } from './types';
import { createPalette } from './colors';
import { calcMetadata } from './metadata';
import { generateTile } from './generate';
import { generatePreviewHtml } from './html';
import { projectGeoToMap, calcTileList } from './geo';
import { dataFile, zoomRange, colorScale, paletteSize, gamma, reverse } from './settings';

const csv = fs.readFileSync(path.join(__dirname, '..', 'data', dataFile), 'utf8');

const samples: Sample[] = parse(csv, { columns: true }).map((record: any) => {
    const geoPoint: Point = [Number(record['Longitude']), Number(record['Latitude'])];
    const mapPoint = projectGeoToMap(geoPoint);
    const value = Number(record['Value']);

    return { value, geoPoint, mapPoint };
});

const tree = new KDBush<Point>(samples.map((sample) => sample.mapPoint));
const metadata = calcMetadata(samples);
const tileList = calcTileList(metadata.mapBound, zoomRange);
const palette = createPalette(colorScale, paletteSize, gamma, reverse);
const html = generatePreviewHtml(metadata, palette);

console.log(`Starting tile generation. Tiles to generate: ${tileList.length}.\n`);

const startTime = Date.now();

for (let i = 0; i < tileList.length; i++) {
    const coords = tileList[i];

    const startTime = Date.now();

    generateTile(samples, tree, coords, metadata, palette);

    const elapsedTime = Date.now() - startTime;
    const progress = Math.round(((i + 1) / tileList.length) * 100);

    console.log(
        `* Tile [${coords[0]}, ${coords[1]}, ${coords[2]}] generated in ${elapsedTime}ms. Progress: ${progress}%.`,
    );
}

const elapsedTime = Date.now() - startTime;

fs.writeFileSync(path.join(__dirname, '..', 'dist', 'index.html'), html, 'utf8');

console.log(`\nTile generation successful. Total time: ${elapsedTime / 1000}s.`);
