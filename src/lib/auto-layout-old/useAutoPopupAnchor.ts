import { useCallback, type Component } from 'react'
import { type HtmlPortalNode } from 'react-reverse-portal'

import {
  type AutoLayoutNumericalPosFactors,
  useFactorsFromOrigin,
} from './useAutoLayoutOpts.js'
import { useContainerDerivedCoords } from './useContainerDerivedCoords.js'

export const useAutoPopupAnchor = ({
  baseIconFactors,
  portalNode,
}: {
  portalNode: HtmlPortalNode<Component<unknown>>
  baseIconFactors: AutoLayoutNumericalPosFactors
}) => {
  const [iconXFactor] = useFactorsFromOrigin(baseIconFactors, 'middle')
  const [, iconRootYFactor] = useFactorsFromOrigin(
    baseIconFactors,
    'bottom-right',
  )
  return useContainerDerivedCoords(portalNode, [
    useCallback(
      (container) => container.offsetWidth * iconXFactor,
      [iconXFactor],
    ),
    useCallback(
      (container) => container.offsetHeight * iconRootYFactor + 7,
      [iconRootYFactor],
    ),
  ])
}
