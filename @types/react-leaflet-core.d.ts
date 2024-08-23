// An issue with the type definitions in react-leaflet means we need this patch to be able to compile
// with `module` set to `nodenext` in `tsconfig.json`.
declare module '@react-leaflet/core/lib/context' {
  import type { Layer } from 'leaflet'
  export type ControlledLayer = {
    addLayer(layer: Layer): void
    removeLayer(layer: Layer): void
  }
}
