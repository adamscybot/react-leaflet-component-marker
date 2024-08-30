import { useCallback } from 'react'

import {
  type AutoLayoutNumericalPosFactors,
  useFactorsFromOrigin,
} from './useAutoLayoutOpts.js'
import { useDynamicCoords } from './useDynamicCoords.js'

export const useAutoPopupAnchor = ({
  baseIconFactors,
}: {
  baseIconFactors: AutoLayoutNumericalPosFactors
}) => {
  const [iconXFactor] = useFactorsFromOrigin(baseIconFactors, 'middle')
  const [, iconRootYFactor] = useFactorsFromOrigin(
    baseIconFactors,
    'bottom-right',
  )

  return useDynamicCoords(
    useCallback(
      ({ portalNode: { element: container } }) =>
        container.offsetWidth * iconXFactor,
      [iconXFactor],
    ),
    useCallback(
      ({ portalNode: { element: container } }) =>
        container.offsetHeight * iconRootYFactor + 7,
      [iconRootYFactor],
    ),
  )
}
