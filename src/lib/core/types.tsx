import type { DivIconOptions, Marker as LeafletMarker } from 'leaflet'
import { type HtmlPortalNode } from 'react-reverse-portal'

import {
  type ReactElement,
  type ComponentType,
  type Component,
  type MutableRefObject,
} from 'react'
import { type MarkerProps as ReactLeafletMarkerProps } from 'react-leaflet'

import type { AutoLayoutOpts } from './auto-layout/useAutoLayoutOpts.js'

/**
 * The possible options for the  {@link ComponentMarkerOpts.layoutMode | `componentIconOpts.layoutMode`} option.
 **/
export type ComponentMarkerLayout = 'auto' | 'manual'

export type ComponentMarkerRootDivIconOpts = Omit<
  DivIconOptions,
  | 'html'
  | 'bgPos'
  | 'shadowUrl'
  | 'shadowSize'
  | 'shadowAnchor'
  | 'shadowRetinaUrl'
  | 'iconUrl'
  | 'iconRetinaUrl'
>
type ManualLayoutOpts = {
  /**
   * When setting
   * {@link ComponentMarkerOpts.layoutMode | `componentIconOpts.layoutMode`} as
   * `'manual'`, these are the {@link DivIconOptions} (except for the `html`
   * property and other properties that are not relevant in the context of a
   * React driven marker) that are to be supplied to the `div` wrapper for the
   * leaflet-managed wrapper of the React icon component.
   *
   * It is expected that
   * {@link ComponentMarkerRootDivIconOpts.iconSize | `componentIconOpts.manualLayoutOpts.iconSize`}
   * and
   * {@link ComponentMarkerRootDivIconOpts.iconAnchor | `componentIconOpts.manualLayoutOpts.iconAnchor`}
   * are set since these define the base dimensions and position of the
   * component in this mode.
   *
   * If using tooltips and/or popups, the relevant offsets for those should also
   * be configured.
   *
   * @see {@link ComponentMarkerRootDivIconOpts}
   */
  manualLayoutOpts?: ComponentMarkerRootDivIconOpts
}
export type AutoLayoutOpt = {
  /**
   * When using the `'auto'` layout mode, this option contains an object that
   * allows the icon position and position of associated controls (i.e. popups &
   * tooltips) to be configured via an ergonomic API that allows offsets to be
   * defined relative to the icons size.
   *
   * If not provided, sensible defaults that match the default behaviour of
   * Leaflet are used.
   *
   * @defaultValue See  options within {@link AutoLayoutOpts}
   */
  autoLayoutOpts?: AutoLayoutOpts
}
export type CoreComponentMarkerOpts = {
  /**
   * * `'auto'` - Instructs this library to orchestrate and automatically infer
   * the underlying Leaflet offsets such that the marker and supplementary
   * controls like `<Popup>` and `<Tooltip>` are sensibly positioned. By
   * default, the positioning behavior matches the positioning of the default
   * marker icon, but scaled to work with any size icon dynamically. The size of
   * the icon is decided by the provided component itself (dynamic), and offsets
   * are auto-magically calculated on the fly. Additionally, this layout mode
   * provides an ergonomic api for adjusting positioning _relative_ to the
   * component icon, instead of only absolute pixel values. See
   * {@link AutoLayoutOpt.autoLayoutOpts | `componentIconOpts.autoLayoutOpts`}
   * docs for further details of available options and default behaviors.
   *
   * * `'manual'` - **This mode is not recommended and is useful only as an
   * escape hatch.** Disables all intelligent & automated positioning logic
   * provided by this library, and instead defers to the provided
   * {@link ManualLayoutOpts.manualLayoutOpts | `componentIconOpts.manualLayoutOpts`}
   * which are supplied directly to Leaflet. The user supplied Icon component
   * itself should use a width and height of `100%` to fill the container.
   *
   * @see {@link ComponentMarkerLayout}
   * @defaultValue `'auto'`
   */
  layoutMode?: ComponentMarkerLayout

  /**
   * If set to `true`, panning/scrolling the map will not be possible "through"
   * the component marker.
   *
   * This applies to the entire component marker.
   *
   * @defaultValue `false`
   */
  disableScrollPropagation?: boolean

  /**
   * If set to `true`, clicking on the component marker will not be captured by
   * the underlying map.
   *
   * This applies to the entire component marker. Note this will also disable
   * the ability to activate native react-leaflet popups via clicking.
   *
   * @defaultValue `false`
   */
  disableClickPropagation?: boolean

  /**
   * Enable or disable the console warning about the case where the
   * {@link BaseMarkerProps.componentIconOpts | `componentIconOpts`} prop was
   * set but the {@link BaseMarkerProps.icon | `icon`} prop is not a component.
   * This would mean those options are unused.
   *
   * @see {@link BaseMarkerProps.componentIconOpts}
   * @defaultValue `true`
   */
  unusedOptsWarning?: boolean

  /**
   * Enable or disable the console warning about the case where
   * {@link ComponentMarkerOpts.layoutMode | `componentIconOpts.layoutMode`} was
   * set to `manual` but the
   * {@link ComponentMarkerRootDivIconOpts.iconSize | `componentIconOpts.manualLayoutOpts.iconSize`}
   * has not been set. This would mean the size of the React component icon
   * would not be visible.
   *
   * @see {@link ComponentMarkerOpts.manualLayoutOpts}
   * @see {@link ComponentMarkerRootDivIconOpts.iconSize}
   * @defaultValue `true`
   */
  rootSizeWarning?: boolean
} & Pick<DivIconOptions, 'className' | 'attribution' | 'pane'>
type UnionKeys<T> = T extends T ? keyof T : never
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StrictUnionHelper<T, TAll> = T extends any
  ? T & Partial<Record<Exclude<UnionKeys<TAll>, keyof T>, undefined>>
  : never
type StrictUnion<T> = StrictUnionHelper<T, T>

export type AutoComponentMarkerOpts = CoreComponentMarkerOpts &
  AutoLayoutOpt & {
    layoutMode?: 'auto'
    manualLayoutOpts?: undefined
  }

export type ManualComponentMarkerOpts = CoreComponentMarkerOpts &
  ManualLayoutOpts & {
    layoutMode: 'manual'
    autoLayoutOpts?: undefined
  }

export type AllComponentMarkerOpts = StrictUnion<
  ManualComponentMarkerOpts | AutoComponentMarkerOpts
>

export type BaseMarkerProps<
  AdditionalIconTypes = never,
  ComponentMarkerOpts = AllComponentMarkerOpts,
> = Omit<ReactLeafletMarkerProps, 'icon'> & {
  /** A {@link ReactElement} representing the Markers icon, or any type from [react-leaflet Marker](https://react-leaflet.js.org/docs/api-components/#marker) component. */
  icon: ReactElement | AdditionalIconTypes

  /**
   * The {@link ComponentMarkerOpts}. These will not be effective if
   * {@link BaseMarkerProps.icon | `icon`} is not set to a React Element or
   * Component, and a warning will be given in the console.
   *
   * @see {@link ComponentMarkerOpts.unusedOptsWarning}
   */
  componentIconOpts?: ComponentMarkerOpts
}

export type MarkerProps = BaseMarkerProps<
  ReactLeafletMarkerProps['icon'] | ComponentType
>

export type MarkerLayoutEvaluatorInput = {
  portalNode: HtmlPortalNode<Component<unknown>>
  markerRef: MutableRefObject<null | LeafletMarker>
}

export const COMPONENT_MARKER_LAYOUT_PROPERTY = Symbol.for(
  '__react_leaflet_component_marker_layout',
)

export type MarkerLayoutEvaluatorOutput = Omit<DivIconOptions, 'html'> & {
  rootStyle: string
}

export type MarkerLayoutHook<Opts extends Record<string, unknown>> = (
  opts: Opts,
) => MarkerLayoutEvaluator<any>

export interface MarkerLayoutEvaluator<Name extends string> {
  (initOpts: MarkerLayoutEvaluatorInput): MarkerLayoutEvaluatorOutput
  [COMPONENT_MARKER_LAYOUT_PROPERTY]: Name
}

export type ComponentMarkerProps = Omit<ReactLeafletMarkerProps, 'icon'> & {
  icon: ReactElement
  layout: MarkerLayoutEvaluator<any>
  /**
   * If set to `true`, panning/scrolling the map will not be possible "through"
   * the component marker.
   *
   * This applies to the entire component marker.
   *
   * @defaultValue `false`
   */
  disableScrollPropagation?: boolean

  /**
   * If set to `true`, clicking on the component marker will not be captured by
   * the underlying map.
   *
   * This applies to the entire component marker. Note this will also disable
   * the ability to activate native react-leaflet popups via clicking.
   *
   * @defaultValue `false`
   */
  disableClickPropagation?: boolean
}
