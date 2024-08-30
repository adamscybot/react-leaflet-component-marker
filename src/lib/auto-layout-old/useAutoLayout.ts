import { type Component, type MutableRefObject } from 'react'
import { type HtmlPortalNode } from 'react-reverse-portal'
import {
  type DivIconOptions,
  type LatLngExpression,
  type Marker as LeafletMarker,
} from 'leaflet'

import { useMarkerLayout } from '../core/useBaseDivIcon.js'
import { useAutoTooltipAnchor } from './useAutoTooltipAnchor.js'
import {
  type AutoLayoutOpts,
  useAutoLayoutIconFactors,
  useFactorsFromOrigin,
} from './useAutoLayoutOpts.js'
import { useAutoPopupAnchor } from './useAutoPopupAnchor.js'

type UseAutoLayoutOpts = {
  autoLayoutOpts?: AutoLayoutOpts
  markerRef: MutableRefObject<LeafletMarker | null>
  portalNode: HtmlPortalNode<Component<unknown>>
  position: LatLngExpression
} & Pick<DivIconOptions, 'className' | 'attribution' | 'pane'>

export const useAutoLayout = ({
  autoLayoutOpts,
  markerRef,
  portalNode,
  position,
  pane,
  attribution,
  className,
}: UseAutoLayoutOpts) => {
  const baseIconFactors = useAutoLayoutIconFactors(
    autoLayoutOpts?.icon?.locationAnchor,
  )

  const dynamicTooltipAnchor = useAutoTooltipAnchor({
    markerRef,
    portalNode,
    position,
    baseIconFactors,
  })

  const dynamicPopupAnchor = useAutoPopupAnchor({ baseIconFactors, portalNode })
  // const iconDeps = [
  //   id,
  //   layoutMode,
  //   attribution,
  //   className,
  //   pane,
  //   Boolean(disableClickPropagation),
  //   Boolean(disableScrollPropagation),
  //   dynamicPopupAnchor,
  //   dynamicTooltipAnchor,
  //   ...useCoordsFromPointExpression(iconSize),
  //   ...useCoordsFromPointExpression(iconAnchor),
  //   ...useCoordsFromPointExpression(popupAnchor),
  //   ...useCoordsFromPointExpression(tooltipAnchor),
  // ]

  // Since the leaflet container icon size is a zero width and height div positioned
  // on the marker location in auto layout mode, the icon's default paint position
  // is to the bottom right of the location in accordance with standard HTML layout
  // flow. We need to account for this as factors provided by presets/user are based
  // on the positioning of the icon.
  const [iconRootXFactor, iconRootYFactor] = useFactorsFromOrigin(
    baseIconFactors,
    'bottom-right',
  )

  return useMarkerLayout({
    rootStyle: `width: min-content; transform: translate(${iconRootXFactor * 100}%, ${iconRootYFactor * 100}%)`,
    popupAnchor: dynamicPopupAnchor,
    tooltipAnchor: dynamicTooltipAnchor,
    pane,
    attribution,
    className,
  })
}
