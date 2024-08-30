import { useId, useMemo } from 'react'
import { type DivIcon, divIcon, type PointExpression } from 'leaflet'
import { type MarkerLayoutEvaluatorOutput } from './types.js'

export type RootDivIconBag = {
  divIcon: DivIcon
  id: string
}

const DEFAULT_ICON_SIZE: PointExpression = [0, 0]

export const useBaseDivIcon = ({
  rootStyle,
  className,
  attribution,
  pane,
  popupAnchor,
  tooltipAnchor,
  iconAnchor = DEFAULT_ICON_SIZE,
  iconSize,
}: MarkerLayoutEvaluatorOutput): RootDivIconBag => {
  const id = 'marker-' + useId()
  const icon = useMemo(() => {
    // const parentStyles =
    //   layoutMode === 'auto'
    //     ? `width: min-content; transform: translate(${iconRootXFactor * 100}%, ${iconRootYFactor * 100}%)`
    //     : 'width: 100%; height: 100%'

    const divIconInstance = divIcon({
      html: `<div data-react-component-marker="root" style="${rootStyle}" id="${id}"></div>`,
      iconSize,
      iconAnchor,
      popupAnchor,
      tooltipAnchor,
      className,
      attribution,
      pane,
    })

    return divIconInstance
  }, [
    id,
    className,
    attribution,
    pane,
    rootStyle,
    popupAnchor,
    tooltipAnchor,
    iconAnchor,
    iconSize,
  ])

  return { divIcon: icon, id }
}
