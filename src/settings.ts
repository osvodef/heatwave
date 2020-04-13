import { d3ColorScale } from './types';

// Название файла с данными. Файлы лежат в папке data.
export const dataFile = 'msk.csv';

// Название палитры из d3. Палитры описаны здесь: https://github.com/d3/d3-scale-chromatic
// Можно использовать любую, у которой название начинается с «interpolate».
export const colorScale: d3ColorScale = 'interpolateMagma';

// Количество цветов в палитре.
export const paletteSize = 12;

// В дискретном режиме переходы между цветами ступенчатые, как хитмапах на R.
// В непрерывном цвета плавно интерполируются.
export const discrete = false;

// Нужно ли разворачивать палитру в обратном направлении. Если карта тёмная, лучше,
// когда в начале палитры более тёмные оттенки, и наоборот.
export const reverse = false;

// Гамма-коррекция. Значения меньше 1 делают хитмап ярче, больше 1 — тускнее.
// Математика аналогично параметру base в аниматорах Zenith.
export const gamma = 0.25;

// Размер тайла в пикселях.
export const tileSizePx = 256;

// opacity тайлового слоя (влияет только на preview-страницу, у самих тайлов opacity=1).
export const opacity = 0.8;

// Диапазон зумов, для которых генерить тайлы.
export const zoomRange = { min: 0, max: 12 };

// Радиус влияния точек данных в мап-координатах.
export const radius = 1000000;

// Степень, в которую возводится обратное расстояние при расчёте IDW.
export const power = 2;
