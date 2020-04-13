import { Bound } from './bound';
import { degToRad, clamp } from './utils';
import { TileCoords, Point, Range } from './types';

/**
 * Вычисляет список тайлов для переданного баунда и набора зумов.
 */
export function calcTileList(bound: Bound, zoomRange: Range): TileCoords[] {
    const result: TileCoords[] = [];

    for (let zoom = zoomRange.min; zoom <= zoomRange.max; zoom++) {
        const offset = 2147483648;
        const tileSize = tileZoomToSize(zoom);
        const maxCoord = 2 ** zoom - 1;

        const minXCoord = Math.max(Math.floor((bound.min[0] + offset) / tileSize), 0);
        const maxXCoord = Math.min(Math.floor((bound.max[0] + offset) / tileSize), maxCoord);
        const minYCoord = Math.max(Math.floor((bound.min[1] + offset) / tileSize), 0);
        const maxYCoord = Math.min(Math.floor((bound.max[1] + offset) / tileSize), maxCoord);

        for (let i = minXCoord; i <= maxXCoord; i++) {
            for (let j = minYCoord; j <= maxYCoord; j++) {
                const coords: TileCoords = [i, j, zoom];
                result.push(coords);
            }
        }
    }

    return result;
}

/**
 * Мап-координаты в этом проекте инвертированы по оси Y относительно Zenith,
 * точно так же, как и координаты тайлов.
 */
export function projectGeoToMap(geoPoint: Point): Point {
    const worldSize = 4294967296;
    const worldHalf = worldSize / 2;
    const sin = Math.sin(degToRad(geoPoint[1]));

    const x = (geoPoint[0] * worldSize) / 360;
    const y = -(Math.log((1 + sin) / (1 - sin)) * worldSize) / (4 * Math.PI);

    return [clamp(x, -worldHalf, worldHalf), clamp(y, -worldHalf, worldHalf)];
}

export function tileCoordsToMapPoint(coords: TileCoords): Point {
    const mapTileSize = tileZoomToSize(coords[2]);
    const offset = 2147483648;

    return [coords[0] * mapTileSize - offset, coords[1] * mapTileSize - offset];
}

export function tileZoomToSize(zoom: number): number {
    return 2 ** (32 - zoom);
}
