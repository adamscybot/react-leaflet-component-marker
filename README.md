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

Instead of importing `Marker` from `react-leaflet`, instead import `Marker` from `react-leaflet-component-marker`.

The `icon` prop is extended to allow for a JSX element of your choosing. All other props are identical to the `react-leaflet` [Marker](https://react-leaflet.js.org/docs/api-components/#marker) API.

The `icon` prop can also accept all of the original types of icons that the underlying `react-leaflet` Marker accepts. Though there is no gain in using this library for this case, it may help if you want to just use this library in place of Marker universally.

### Basic Example

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
