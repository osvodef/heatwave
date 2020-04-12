import { Point } from './types';

export class Bound {
    public min: Point;
    public max: Point;

    constructor() {
        this.min = [Infinity, Infinity];
        this.max = [-Infinity, -Infinity];
    }

    public extend(point: Point) {
        const { min, max } = this;
        const x = point[0];
        const y = point[1];

        if (x < min[0]) {
            min[0] = x;
        }

        if (x > max[0]) {
            max[0] = x;
        }

        if (y < min[1]) {
            min[1] = y;
        }

        if (y > max[1]) {
            max[1] = y;
        }
    }
}
