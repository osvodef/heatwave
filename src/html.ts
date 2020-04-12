import { Metadata, Range, Palette } from './types';
import { zoomRange, opacity, discrete } from './settings';

export function generatePreviewHtml(metadata: Metadata, palette: Palette): string {
    const { geoBound, clusters } = metadata;
    const boundString = `[[${geoBound.min[1]}, ${geoBound.min[0]}], [${geoBound.max[1]}, ${geoBound.max[0]}]]`;

    return `
        <!DOCTYPE html>
        <html>
            <head>
                <title>IDW Heatmap Demo</title>
                <script src="https://maps.api.2gis.ru/2.0/loader.js?pkg=full"></script>
                <style>
                    html,
                    body,
                    #map {
                        margin: 0;
                        padding: 0;
                        width: 100%;
                        height: 100%;
                    }

                    .leaflet-tile-pane .leaflet-layer:first-child {
                        filter: grayscale(100) invert();
                    }

                    .leaflet-tile-pane .leaflet-layer:last-child {
                        image-rendering: pixelated;
                    }

                    .legend {
                        position: absolute;
                        top: 0;
                        right: 0;
                        width: 250px;
                        background-color: white;
                        font-family: monospace;
                    }

                    .legend-header {
                        font-size: 14px;
                        margin: 0 0 15px 45px;
                    }

                    .legend-item {
                        display: flex;
                        align-items: center;
                    }

                    .color-indicator {
                        width: 30px;
                        height: 30px;
                        margin-right: 15px;
                    }
                </style>
            </head>
            <body>
                <div id="map"></div>
                <div class="legend">
                    <div class="legend-header">₽ / м²</div>
                    ${getLegendMarkup(clusters, palette)}
                </div>
                <script type="text/javascript">
                    DG.then(function () {
                        const map = DG.map('map', { fullscreenControl: false });

                        map.fitBounds(${boundString});

                        DG.tileLayer('tiles/{z}_{x}_{y}.png', {
                            minNativeZoom: ${zoomRange.min},
                            maxNativeZoom: ${zoomRange.max},
                            opacity: ${opacity},
                        }).addTo(map);

                        window.map = map;
                    });
                </script>
            </body>
        </html>
    `;
}

function getLegendMarkup(clusters: Range[], palette: Palette): string {
    let html = '';

    for (let i = 0; i < palette.length; i++) {
        const color = palette[i];
        const rgb = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
        const caption = discrete
            ? getCaptionDiscrete(clusters, i)
            : getCaptionContinuous(clusters, i);

        html += `
            <div class="legend-item">
                <div class="color-indicator" style="background-color: ${rgb}"></div>
                <div>${caption}</div>
            </div>
        `;
    }

    return html;
}

function getCaptionDiscrete(clusters: Range[], index: number): string {
    return `${formatNumber(clusters[index].min)} to ${formatNumber(clusters[index].max)}`;
}

function getCaptionContinuous(clusters: Range[], index: number): string {
    if (index === clusters.length) {
        return `${formatNumber(clusters[index - 1].max)}`;
    }

    return `${formatNumber(clusters[index].min)}`;
}

function formatNumber(value: number): string {
    return Math.round(value)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
