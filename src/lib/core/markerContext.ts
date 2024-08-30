import { createContext, type MutableRefObject, useContext } from 'react'
import { type Marker as LeafletMarker } from 'leaflet'

export type MarkerContextType = {
  /**
   * Contains the relevant internal Leaflet Marker class that is represented by
   * the icon component that this hook is used inside of.
   *
   * @see https://leafletjs.com/reference.html#marker
   */
  leafletMarker: MutableRefObject<LeafletMarker | null>
}

export const MarkerContext = createContext<MarkerContextType | null>(null)

/**
 * Can be used only inside a React component that has been passed to the `icon`
 * prop of `<Marker>` from the @adamscybot/react-leaflet-component-marker
 * package.
 *
 * Currently returns an object with a `leafletMarkerKey` containing the relevant
 * internal Leaflet Marker class that is represented by the icon component that
 * this hook is used inside of.
 *
 * May be extended in future to include library specific properties.
 *
 * @returns The {@link MarkerContextType | Marker context} of the marker
 *          which contains the icon component that this hook is being used
 *          in.
 */
export function useMarkerContext(): MarkerContextType {
  const context = useContext(MarkerContext)
  if (context == null) {
    throw new Error(
      'No context provided: useMarkerContext() can only be used in a descendant of a component passed to the `icon` prop of `<Marker>` from the @adamscybot/react-leaflet-component-marker package.',
    )
  }
  return context
}
