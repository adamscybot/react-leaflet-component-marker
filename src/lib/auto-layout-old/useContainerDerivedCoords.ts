import { useCallback, type Component } from 'react'
import { type HtmlPortalNode } from 'react-reverse-portal'
import { useDynamicCoords } from './useDynamicCoords.js'

export type CoordGetterFromContainer = (containerEl: HTMLElement) => number

/**
 * Create a {@link PointTuple} that lazily evaluates provided x/y getters that
 * can compute said values using the container element as input. This enables
 * coords relating to tooltips and popups to be calculated on the fly such that
 * they are relative to the size of the component marker as measured at the time
 * of opening them.
 *
 * @param container  The container portal node of the marker.
 * @param getters    Tuple containing x and y getters.
 * @returns A proxied {@link PointTuple} whereby each coord is derived from
 *          the getters.
 * @see {@link useDynamicCoords}
 */
export const useContainerDerivedCoords = (
  container: HtmlPortalNode<Component<unknown>>,
  [getX, getY]: [CoordGetterFromContainer, CoordGetterFromContainer],
) => {
  const x = useCallback(() => getX(container.element), [container, getX])
  const y = useCallback(() => getY(container.element), [container, getY])
  return useDynamicCoords(x, y)
}
