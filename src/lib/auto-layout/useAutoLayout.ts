import { useCallback } from 'react'
import { useDefineLayout } from '../core/useDefineLayout.js'
import {
  useFactorsFromOrigin,
  type AutoLayoutOpts,
} from './useAutoLayoutOpts.js'
import { useAutoLayoutIconFactors } from './useAutoLayoutOpts.js'
import { useAutoTooltipAnchor } from './useAutoTooltipAnchor.js'
import { useAutoPopupAnchor } from './useAutoPopupAnchor.js'

export const useAutoLayout = (opts?: AutoLayoutOpts) => {
  const baseIconFactors = useAutoLayoutIconFactors(opts?.icon?.locationAnchor)

  const getToolTipAnchor = useAutoTooltipAnchor({
    baseIconFactors,
  })

  const getPopupAnchor = useAutoPopupAnchor({
    baseIconFactors,
  })

  // Since the leaflet container icon size is a zero width and height div positioned
  // on the marker location in auto layout mode, the icon's default paint position
  // is to the bottom right of the location in accordance with standard HTML layout
  // flow. We need to account for this as factors provided by presets/user are based
  // on the positioning of the icon.
  const [iconRootXFactor, iconRootYFactor] = useFactorsFromOrigin(
    baseIconFactors,
    'bottom-right',
  )

  return useDefineLayout(
    'auto-layout',
    useCallback(
      (init) => ({
        rootStyle: `width: min-content; transform: translate(${iconRootXFactor * 100}%, ${iconRootYFactor * 100}%)`,
        popupAnchor: getPopupAnchor(init),
        tooltipAnchor: getToolTipAnchor(init),
      }),
      [getToolTipAnchor, getPopupAnchor, iconRootXFactor, iconRootYFactor],
    ),
  )
}
