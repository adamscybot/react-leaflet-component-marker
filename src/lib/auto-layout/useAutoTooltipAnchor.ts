import { useCallback } from 'react'

import {
  type AutoLayoutNumericalPosFactors,
  useFactorsFromOrigin,
} from './useAutoLayoutOpts.js'
import { useDynamicCoords } from './useDynamicCoords.js'

/**
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
 *
 * @returns Proxied {@link PointTuple} that returns computed Tooltip anchor
 *          position based on component icon dimensions.
 */
export const useAutoTooltipAnchor = ({
  baseIconFactors,
}: {
  baseIconFactors: AutoLayoutNumericalPosFactors
}) => {
  const [iconXFactor, iconYFactor] = useFactorsFromOrigin(
    baseIconFactors,
    'middle',
  )

  return useDynamicCoords(
    useCallback(
      ({ portalNode: { element: container }, markerRef }) => {
        // @ts-expect-error `_tooltip` is a pseudo-private property, but
        // we need to access it here to be able to detect tooltip direction in a way
        // that we don't introduce extra overhead for the dev (e.g new wrapper for `<Tooltip>`)
        const direction = markerRef.current?._tooltip?.options?.direction

        const isAutoDirection = direction === 'auto' || direction === undefined
        const isAutoDirectionOnLeft = isAutoDirection
        // &&
        //   map.latLngToContainerPoint(position).x >=
        //     map.latLngToContainerPoint(map.getCenter()).x

        const isExplicitLeft = direction === 'left'

        return (
          (container.offsetWidth / 2) * (isExplicitLeft ? -1 : 1) +
          iconXFactor * container.offsetWidth * (isAutoDirectionOnLeft ? -1 : 1)
        )
      },
      [iconXFactor],
    ),
    useCallback(
      ({ portalNode: { element: container } }) =>
        container.offsetHeight * iconYFactor,
      [iconYFactor],
    ),
  )
}
