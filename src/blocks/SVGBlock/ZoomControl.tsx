import React from 'react'

interface ZoomControlsProps {
  zoomIn: () => void
  zoomOut: () => void
}
const ZoomControls: React.FC<ZoomControlsProps> = ({ zoomIn, zoomOut }) => (
  <div className="zoom-controls flex gap-2">
    <button
      onClick={zoomIn}
      className="w-8 h-8 bg-white border border-gray-300 rounded flex items-center justify-center text-lg font-bold"
    >
      +
    </button>
    <button
      onClick={zoomOut}
      className="w-8 h-8 bg-white border border-gray-300 rounded flex items-center justify-center text-lg font-bold"
    >
      −
    </button>
  </div>
)

export default React.memo(ZoomControls)
