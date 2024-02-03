# react-leaflet-component-marker

A tiny wrapper for [react-leaflet](https://react-leaflet.js.org/)'s `<Marker />` component that allows you to use a React component as a marker, with working state, handlers, and access to parent contexts.

The approach this library uses differs from other approaches that use `renderToString` in that it instead uses React's [Portal](https://react.dev/reference/react-dom/createPortal) functionality to achieve the effect. That means the component is not static, but a full first-class component that can have its own state, event handlers & lifecycle.

This library is typed via TypeScript.

# Docs

## Installation

Install using your projects package manager.

**NPM**

```bash
npm install --save @adamscybot/react-leaflet-component-marker
```

**Yarn**

```bash
yarn install --save @adamscybot/react-leaflet-component-marker
```

**PNPM**

```bash
pnpm add @adamscybot/react-leaflet-component-marker
```

## Usage

### Using a React Component as a marker

Instead of importing `Marker` from `react-leaflet`, instead import `Marker` from `react-leaflet-component-marker`.

The `icon` prop is extended to allow for a JSX element of your choosing. All other props are identical to the `react-leaflet` [Marker](https://react-leaflet.js.org/docs/api-components/#marker) API.

The `icon` prop can also accept all of the original types of icons that the underlying `react-leaflet` Marker accepts. Though there is no gain in using this library for this case, it may help if you want to just use this library in place of Marker universally.

#### Basic Example

```javascript
import React from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import { Marker } from '@adamscybot/react-leaflet-component-marker'
import 'leaflet/dist/leaflet.css'

const MarkerIconExample = () => {
  return (
    <>
      <button onClick={() => console.log('button 1 clicked')}>Button 1</button>
      <button onClick={() => console.log('button 2 clicked')}>Button 2</button>
    </>
  )
}

const CENTER = [51.505, -0.091]
const ZOOM = 13
const App = () => {
  return (
    <MapContainer center={CENTER} zoom={ZOOM}>
      <TileLayer
        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.osm.org/{z}/{x}/{y}.png"
      />
      <Marker position={CENTER} icon={<MarkerIconExample />} />
    </MapContainer>
  )
}
```

### Advanced Sizing and Positioning

Note, that it is often possible to achieve the desired effect by use of margins/padding on the React icon component itself. However, in some cases, adjustments may be needed to get pixel perfect like popup positioning

`iconComponentOpts` can be passed which provides a subset of the [options](https://leafletjs.com/reference.html#icon) that can be passed to an underlying leaflet icon, which is used by this library as an intermediary wrapper. It should be considered an escape hatch.

`iconComponentLayout` can be passed to control the alignment and size of the React component. It defaults to `fit-content`, meaning the React Component decides its own size and is not constrained by `iconSize` (which defaults to `[0,0]`). The library automatically handles the alignment of the component such that it is centred horizontally with the marker coordinates, regardless of the component's size (which can even change dynamically). Note the anchor options that can be passed to `iconComponentOpts` remain functional with `fit-content`.

If more granular control is needed, `iconComponentLayout` can be set `fit-parent` which defers all sizing and positioning to leaflets configuration options, that can be provided via the aforementioned `iconComponentOpts`. This means you will likely need to pass an `iconSize` to `iconComponentOpts`. In this mode, the React icon component should also have a root element that has a width and height of 100%, and it should prevent overflowing. The downside to this approach is the component size is inherently static. The upside is Leaflet knows about the icon size, and so the default anchor coordinates for other elements like popups, will be likely closer to the default expectations.

### Gotchas

Currently, if any options in `iconComponentOpts` have a material change (new `iconSize` or changed anchors), the React Component will completely remount and lose any state it had. This will be fixed in a future release.

Hot reloading causes markers to disappear. This will be fixed in a future release.
