import { type MutableRefObject, useCallback, type Component } from 'react'
import { type HtmlPortalNode } from 'react-reverse-portal'
import { useMap } from 'react-leaflet'
import { type LatLngExpression, type Marker as LeafletMarker } from 'leaflet'

import { useContainerDerivedCoords } from './useContainerDerivedCoords.js'
import {
  type AutoLayoutNumericalPosFactors,
  useFactorsFromOrigin,
} from './useAutoLayoutOpts.js'

/**
 * @returns Proxied {@link PointTuple} that returns computed Tooltip anchor
 *          position based on component icon dimensions.
 * @remarks
 * Leaflet's tooltip "auto" positioning (i.e. `direction` prop on `<Tooltip>` is
 * either unset or explicitly set to `'auto'`) which is problematic as it is
 * assumes that `iconAnchor` is being used to control the icon location relative
 * to the marker position, on the x axis.
 *
 * We do not use `iconAnchor` in our own auto layout mode since it requires
 * absolute dimensions that would be antithetical to this libraries goal of
 * allowing any component to be dropped in as an icon and have the layout
 * dynamically change dependant on that icons _own_ size automatically (and
 * without using tons of resize observers for every marker). Therefore, in our
 * auto layout mode, we effectively use an `iconAnchor` of `[0, 0]`, which does
 * not reflect the icons real position if there is an off-center icon anchor set
 * via `autoLayoutPos`. This leads to broken tooltip positioning.
 *
 * Another problem also occurs if `direction` is explicitly set to left.
 * In this case, our own internal offsets also need to tweaked.
 *
 * In order to be compatible with that logic, we detect the scenarios in which
 * this calculation needs adjustment and apply appropriate modifiers.
 */
export const useAutoTooltipAnchor = ({
  markerRef,
  portalNode,
  position,
  baseIconFactors,
}: {
  portalNode: HtmlPortalNode<Component<unknown>>
  markerRef: MutableRefObject<LeafletMarker | null>
  position: LatLngExpression
  baseIconFactors: AutoLayoutNumericalPosFactors
}) => {
  const map = useMap()

  const [iconXFactor, iconYFactor] = useFactorsFromOrigin(
    baseIconFactors,
    'middle',
  )

  return useContainerDerivedCoords(portalNode, [
    useCallback(
      (container) => {
        // @ts-expect-error `_tooltip` is a pseudo-private property, but
        // we need to access it here to be able to detect tooltip direction in a way
        // that we don't introduce extra overhead for the dev (e.g new wrapper for `<Tooltip>`)
        const direction = markerRef.current?._tooltip?.options?.direction

        const isAutoDirection = direction === 'auto' || direction === undefined
        const isAutoDirectionOnLeft =
          isAutoDirection &&
          map.latLngToContainerPoint(position).x >=
            map.latLngToContainerPoint(map.getCenter()).x

        const isExplicitLeft = direction === 'left'

        return (
          (container.offsetWidth / 2) * (isExplicitLeft ? -1 : 1) +
          iconXFactor * container.offsetWidth * (isAutoDirectionOnLeft ? -1 : 1)
        )
      },
      [iconXFactor, map, markerRef, position],
    ),
    useCallback(
      (container) => container.offsetHeight * iconYFactor,
      [iconYFactor],
    ),
  ])
}
