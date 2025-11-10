'use client'

import ReactSnowfall from 'react-snowfall'

export default function Snowfall() {
  return (
    <ReactSnowfall
      color="#ffffff"
      snowflakeCount={80}
      speed={[0.5, 1.5]}
      wind={[-0.5, 1.0]}
      radius={[0.5, 3.0]}
      style={{
        position: 'fixed',
        width: '100vw',
        height: '100vh',
        zIndex: 50,
        pointerEvents: 'none',
      }}
    />
  )
}
