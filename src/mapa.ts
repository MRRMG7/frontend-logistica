import type { StyleSpecification } from "maplibre-gl";

// Área aproximada de El Salvador para limitar el desplazamiento de los mapas.
export const LIMITES_EL_SALVADOR: [[number, number], [number, number]] = [
  [-90.15, 13.1],
  [-87.65, 14.45],
];

export function estaDentroDeElSalvador(lat: number, lng: number): boolean {
  const [[oeste, sur], [este, norte]] = LIMITES_EL_SALVADOR;
  return Number.isFinite(lat) && Number.isFinite(lng) &&
    lng >= oeste && lng <= este && lat >= sur && lat <= norte;
}

export const ESTILO_MAPA: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tileSize: 256,
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      attribution: "© OpenStreetMap",
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }],
};
