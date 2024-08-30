import { makeLayoutComponent } from '../core/makeLayoutComponent.js'
import { useAutoLayout } from './useAutoLayout.js'

export const AutoLayoutMarker = makeLayoutComponent(useAutoLayout, 'AutoLayout')
