import React, { forwardRef, useMemo, useRef } from 'react'
import { type Marker as LeafletMarker } from 'leaflet'
import { mergeRefs } from 'react-merge-refs'
import {
  COMPONENT_MARKER_LAYOUT_PROPERTY,
  type ComponentMarkerProps,
} from './types.js'
import { createHtmlPortalNode } from 'react-reverse-portal'
import { InjectedMarker } from './InjectedMarker.js'
import { useBaseDivIcon } from './useBaseDivIcon.js'
import { logCodedString } from '../logging.js'

export const ComponentMarker = forwardRef<LeafletMarker, ComponentMarkerProps>(
  ({ icon, layout, ...otherProps }, ref) => {
    const markerRef = useRef<LeafletMarker | null>(null)
    const portalNode = useMemo(
      () =>
        createHtmlPortalNode({
          attributes: {
            'data-react-component-marker': 'portal-parent',
            style: 'width:100%;height:100%;',
          },
        }),
      [],
    )

    const evaluatedLayout = useMemo(() => {
      if (layout[COMPONENT_MARKER_LAYOUT_PROPERTY] === undefined) {
        throw new TypeError(
          logCodedString(
            'BAD_LAYOUT',
            'A layout was passed that was not produced from the `useDefineLayout` hook. Please create layouts via this hook to ensure current and future compatibility.',
          ),
        )
      }

      return layout({ portalNode, markerRef })
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      layout,
      portalNode,
      otherProps.disableClickPropagation,
      otherProps.disableScrollPropagation,
    ])

    const rootDivIcon = useBaseDivIcon(evaluatedLayout)

    return (
      <InjectedMarker
        {...otherProps}
        ref={mergeRefs([markerRef, ref])}
        renderIcon={icon}
        rootDivIcon={rootDivIcon}
        portalNode={portalNode}
      />
    )
  },
)

ComponentMarker.displayName = 'ComponentMarker'
