import { Bound } from './bound';

export type Point = [number, number];
export type RGB = [number, number, number];
export type TileCoords = [number, number, number];

export type Palette = RGB[];

export interface Sample {
    mapPoint: Point;
    geoPoint: Point;
    value: number;
}

export interface Range {
    min: number;
    max: number;
}

export interface Metadata {
    geoBound: Bound;
    mapBound: Bound;
    clusters: Range[];
}

export type d3ColorScale =
    | 'interpolateBlues'
    | 'interpolateBrBG'
    | 'interpolateBuGn'
    | 'interpolateBuPu'
    | 'interpolateCividis'
    | 'interpolateCool'
    | 'interpolateCubehelixDefault'
    | 'interpolateGnBu'
    | 'interpolateGreens'
    | 'interpolateGreys'
    | 'interpolateInferno'
    | 'interpolateMagma'
    | 'interpolateOrRd'
    | 'interpolateOranges'
    | 'interpolatePRGn'
    | 'interpolatePiYG'
    | 'interpolatePlasma'
    | 'interpolatePuBu'
    | 'interpolatePuBuGn'
    | 'interpolatePuOr'
    | 'interpolatePuRd'
    | 'interpolatePurples'
    | 'interpolateRainbow'
    | 'interpolateRdBu'
    | 'interpolateRdGy'
    | 'interpolateRdPu'
    | 'interpolateRdYlBu'
    | 'interpolateRdYlGn'
    | 'interpolateReds'
    | 'interpolateSinebow'
    | 'interpolateSpectral'
    | 'interpolateTurbo'
    | 'interpolateViridis'
    | 'interpolateWarm'
    | 'interpolateYlGn'
    | 'interpolateYlGnBu'
    | 'interpolateYlOrBr'
    | 'interpolateYlOrRd';
