'use client'
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { Blocktype, Media, SvgBlock as SVGBlockProps, SvgCode } from '@/payload-types'
import { Button } from '@/components/ui/button'
import { AlignLeft } from 'lucide-react'
import Image from 'next/image'
import { debounce } from 'lodash'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import Menu from './Menu'
import { getBackgroundUrl, parsePathBounds, parsePolygonBounds } from './utils'
import SVGItemComponent from './SVGItemComponent'
import ZoomControls from './ZoomControl'

export interface SVGItem {
  id: string
  type: 'path' | 'polygon'
  path?: string | null
  points?: string | null
  fill?: string | null
  stroke?: string | null
  'stroke-width'?: number | null
  action?: ('none' | 'link' | 'modal') | null
  link?: string | null
  modalId?: string | null
  blocktype?: Blocktype | null
  title?: string | null
  giaban?: string | null
  area?: string | null
  price?: string | null
  status?: 'Sold' | 'Pending' | null
  linkMatbang?: string | null
  dientichdat?: string | null
  dientichsanxaydung?: string | null
  viewImages?: {
    image: string | Media
    id?: string | null
  }[] | null
}

const LoadingScreen: React.FC = () => (
  <div className="flex items-center justify-center h-screen w-screen bg-green-900">
    <Image
      src="/LOGO SGI.png"
      className="md:h-48 h-24 w-auto animate-bounce"
      alt="Logo SGI"
      width={500}
      height={100}
      priority
    />
  </div>
)

const ModalSVGBlock = dynamic(() => import('./ModalSVGBlock'), { ssr: false })

const SVGBlock: React.FC<SVGBlockProps> = ({ title, svgCode, background, viewbox, id, transform, width, height, logo, checkCanBlock }) => {
  const ref = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const tooltipMeasureRef = useRef<HTMLDivElement>(null)
  const [svgItems, setSvgItems] = useState<SVGItem[]>([])
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [groupNames, setGroupNames] = useState<string[]>([])
  const [selectedBlocktype, setSelectedBlocktype] = useState<string | null>(null)
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [viewBox, setViewBox] = useState<string>(viewbox)
  const [zoomLevel, setZoomLevel] = useState<number>(1)
  const [isPanning, setIsPanning] = useState<boolean>(false)
  const [lastMousePos, setLastMousePos] = useState<{ x: number; y: number } | null>(null)
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [selectedSVGItem, setSelectedSVGItem] = useState<SVGItem | null>(null)
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [tooltipDimensions, setTooltipDimensions] = useState<{ [key: string]: { width: number; height: number } }>({})
  const animationFrameRef = useRef<number | null>(null)

  const MIN_ZOOM = 1
  const MAX_ZOOM = 4
  const ZOOM_STEP = 0.5
  const TOOLTIP_WIDTH = 250

  // Memoize bounds parsing for getVisibleItems and tooltip positioning
  const itemBounds = useMemo(() => {
    const boundsMap = new Map<string, { minX: number; minY: number; maxX: number; maxY: number }>()
    if (!svgCode || !Array.isArray(svgCode)) return boundsMap
    svgCode.forEach((item: any) => {
      try {
        const bounds = item.type === 'path' ? parsePathBounds(item.path) : parsePolygonBounds(item.points)
        if (bounds && isFinite(bounds.minX) && isFinite(bounds.minY) && isFinite(bounds.maxX) && isFinite(bounds.maxY)) {
          boundsMap.set(item.id, bounds)
        } else {
          console.warn(`Invalid bounds for item ${item.id}:`, bounds)
        }
      } catch (error) {
        console.error(`Error parsing bounds for item ${item.id}:`, error)
      }
    })
    return boundsMap
  }, [svgCode])

  const getVisibleItems = useMemo(() => {
    if (!svgCode) return []
    const [vbX, vbY, vbWidth, vbHeight] = viewBox.split(' ').map(Number)
    if (!isFinite(vbX) || !isFinite(vbY) || !isFinite(vbWidth) || !isFinite(vbHeight)) {
      console.warn('Invalid viewBox values:', viewBox)
      return []
    }
    const padding = Math.max(vbWidth, vbHeight) * 0.1
    return (svgCode as SvgCode[]).filter((item: SvgCode) => {
      const bounds = itemBounds.get(item.id)
      if (!bounds) {
        console.warn(`No bounds found for item ${item.id}`)
        return false
      }
      const { minX, minY, maxX, maxY } = bounds
      if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) {
        console.warn(`Invalid bounds for item ${item.id}:`, bounds)
        return false
      }
      return (
        maxX >= vbX - padding &&
        minX <= vbX + vbWidth + padding &&
        maxY >= vbY - padding &&
        minY <= vbY + vbHeight + padding
      )
    })
  }, [svgCode, viewBox, itemBounds])

  const getBlockTypes = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/blocktype/?depth=2&limit=100', { next: { revalidate: 3600 } })
      const data = await res.json()
      const blocktypes = data.docs
      const svgBlockTypeTitles = new Set<string>(
        (svgCode as SvgCode[])?.filter((item) => item.blocktype && (item.blocktype as Blocktype).title)
          .map((item) => (item.blocktype as Blocktype).title.split('-')[0].trim()) || []
      )
      const grouped = blocktypes.reduce((acc: Record<string, string[]>, blocktype: Blocktype) => {
        const groupName = blocktype.title.split('-')[0].trim()
        if (svgBlockTypeTitles.has(groupName)) {
          acc[groupName] = acc[groupName] || []
          acc[groupName].push(blocktype.id)
        }
        return acc
      }, {})
      setGroupNames(['Tất cả', ...Object.keys(grouped).sort()])
    } finally {
      setIsLoading(false)
    }
  }, [svgCode])

  // Measure tooltip dimensions dynamically
  useEffect(() => {
    if (tooltipMeasureRef.current && activeTooltipId) {
      const measureTooltip = () => {
        if (tooltipMeasureRef.current) {
          const { width, height } = tooltipMeasureRef.current.getBoundingClientRect()
          setTooltipDimensions((prev) => ({
            ...prev,
            [activeTooltipId]: { width: TOOLTIP_WIDTH, height }
          }))
        }
      }
      // Use requestAnimationFrame to ensure DOM is fully rendered
      const frameId = requestAnimationFrame(measureTooltip)
      return () => cancelAnimationFrame(frameId)
    }
  }, [activeTooltipId])

  const getTooltipContent = useCallback(
    (item: SVGItem) => {
      const bounds = itemBounds.get(item.id)
      if (!bounds) return null
      const { minX, minY, maxX, maxY } = bounds
      const centerX = (minX + maxX) / 2
      const tooltipWidth = TOOLTIP_WIDTH
      const tooltipHeight = tooltipDimensions[item.id]?.height || 150 // Fallback height
      const tooltipX = centerX - tooltipWidth / 2
      const tooltipY = minY - tooltipHeight - 100 // Increased offset for line
      const lineStartX = centerX
      const lineStartY = minY+10
      const lineEndX = centerX
      const lineEndY = tooltipY + tooltipHeight

      return (
        <g>
          <line
            x1={lineStartX}
            y1={lineStartY}
            x2={lineEndX}
            y2={lineEndY}
            stroke="white"
            strokeWidth="2"
          />
          
          <foreignObject x={tooltipX} y={tooltipY} width={tooltipWidth} height={tooltipHeight}>
            <div className="bg-white p-1 rounded-xl border-white border-2 text-sm">
              <div className="bg-blue-900 p-2 text-white font-bold text-center rounded-t-lg">
                {item.title || 'N/A'}
                <div className="text-xs font-base">{item.blocktype?.title || 'N/A'}</div>
              </div>
              <div className="bg-white text-black p-2">
                <div className="text-black">
                  Diện tích đất: <strong className="text-black">{item.dientichdat || (item.blocktype?.dientichdat || 'N/A')}</strong>
                </div>
                <div className="text-black">
                  Diện tích sàn: <strong className="text-black">{item.dientichsanxaydung || (item.blocktype?.dientichsanxaydung || 'N/A')}</strong>
                </div>
              </div>
              <Button
                onClick={() => {
                  setIsOpen(true)
                  setSelectedSVGItem(item)
                }}
                className="block bg-[#F5F4DA] w-full text-[#0D477C] hover:bg-amber-300 text-xs py-1"
              >
                Xem chi tiết
              </Button>
            </div>
          </foreignObject>
        </g>
      )
    },
    [itemBounds, tooltipDimensions]
  )

  const isBlocktypeInSelectedGroup = useCallback(
    (blocktype: Blocktype | null): boolean => !blocktype || !selectedBlocktype ? false : blocktype.title.includes(selectedBlocktype),
    [selectedBlocktype]
  )

  const getPointerEvents = useCallback(
    (blocktype: Blocktype | null): 'all' | 'none' => !selectedBlocktype || isBlocktypeInSelectedGroup(blocktype) ? 'all' : 'none',
    [selectedBlocktype, isBlocktypeInSelectedGroup]
  )

  const zoomIn = useCallback(() => {
    setZoomLevel((prev) => {
      const newZoomLevel = Math.min(MAX_ZOOM, prev + ZOOM_STEP)
      if (newZoomLevel === prev) return prev
      const [vbX, vbY, vbWidth, vbHeight] = viewBox.split(' ').map(Number)
      const newVbWidth = vbWidth * (prev / newZoomLevel)
      const newVbHeight = vbHeight * (prev / newZoomLevel)
      const centerX = vbX + vbWidth / 2
      const centerY = vbY + vbHeight / 2
      setViewBox(`${centerX - newVbWidth / 2} ${centerY - newVbHeight / 2} ${newVbWidth} ${newVbHeight}`)
      return newZoomLevel
    })
  }, [viewBox])

  const zoomOut = useCallback(() => {
    setZoomLevel((prev) => {
      const newZoomLevel = Math.max(MIN_ZOOM, prev - ZOOM_STEP)
      if (newZoomLevel === prev) return prev
      const newViewBox = newZoomLevel === MIN_ZOOM ? viewbox : (() => {
        const [vbX, vbY, vbWidth, vbHeight] = viewBox.split(' ').map(Number)
        const newVbWidth = vbWidth * (prev / newZoomLevel)
        const newVbHeight = vbHeight * (prev / newZoomLevel)
        const centerX = vbX + vbWidth / 2
        const centerY = vbY + vbHeight / 2
        return `${centerX - newVbWidth / 2} ${centerY - newVbHeight / 2} ${newVbWidth} ${newVbHeight}`
      })()
      setViewBox(newViewBox)
      return newZoomLevel
    })
  }, [viewBox, viewbox])

  const handleMouseDown = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    if (zoomLevel === MIN_ZOOM) return
    setIsPanning(true)
    setLastMousePos({ x: event.clientX, y: event.clientY })
  }, [zoomLevel])

  const handleMouseMove = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    if (!isPanning || !svgRef.current || !lastMousePos) return
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    animationFrameRef.current = requestAnimationFrame(() => {
      const rect = svgRef.current!.getBoundingClientRect()
      const [vbX, vbY, vbWidth, vbHeight] = viewBox.split(' ').map(Number)
      const [origX, origY, origWidth, origHeight] = viewbox.split(' ').map(Number)
      const deltaX = (event.clientX - lastMousePos.x) * (vbWidth / rect.width)
      const deltaY = (event.clientY - lastMousePos.y) * (vbHeight / rect.height)
      const newVbX = Math.max(origX, Math.min(vbX - deltaX, origX + origWidth - vbWidth))
      const newVbY = Math.max(origY, Math.min(vbY - deltaY, origY + origHeight - vbHeight))
      setViewBox(`${newVbX} ${newVbY} ${vbWidth} ${vbHeight}`)
      setLastMousePos({ x: event.clientX, y: event.clientY })
    })
  }, [isPanning, lastMousePos, viewBox, viewbox])

  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
    setLastMousePos(null)
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
  }, [])

  const handleTouchStart = useCallback((event: React.TouchEvent<SVGSVGElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (event.touches.length === 1) {
      if (zoomLevel === MIN_ZOOM) return
      setIsPanning(true)
      setLastMousePos({ x: event.touches[0].clientX, y: event.touches[0].clientY })
    } else if (event.touches.length === 2) {
      setIsPanning(false)
      const distance = Math.hypot(
        event.touches[0].clientX - event.touches[1].clientX,
        event.touches[0].clientY - event.touches[1].clientY
      )
      setLastTouchDistance(distance)
    }
  }, [zoomLevel])

  const handleTouchMove = useCallback((event: React.TouchEvent<SVGSVGElement>) => {
    event.preventDefault()
    event.stopPropagation()
    if (!svgRef.current) return
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    animationFrameRef.current = requestAnimationFrame(() => {
      const rect = svgRef.current!.getBoundingClientRect()
      const [vbX, vbY, vbWidth, vbHeight] = viewBox.split(' ').map(Number)
      const [origX, origY, origWidth, origHeight] = viewbox.split(' ').map(Number)

      if (event.touches.length === 1 && isPanning && lastMousePos) {
        const deltaX = (event.touches[0].clientX - lastMousePos.x) * (vbWidth / rect.width)
        const deltaY = (event.touches[0].clientY - lastMousePos.y) * (vbHeight / rect.height)
        const newVbX = Math.max(origX, Math.min(vbX - deltaX, origX + origWidth - vbWidth))
        const newVbY = Math.max(origY, Math.min(vbY - deltaY, origY + origHeight - vbHeight))
        setViewBox(`${newVbX} ${newVbY} ${vbWidth} ${vbHeight}`)
        setLastMousePos({ x: event.touches[0].clientX, y: event.touches[0].clientY })
      } else if (event.touches.length === 2 && lastTouchDistance !== null) {
        const newDistance = Math.hypot(
          event.touches[0].clientX - event.touches[1].clientX,
          event.touches[0].clientY - event.touches[1].clientY
        )
        const zoomFactor = newDistance / lastTouchDistance
        const newZoomLevel = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoomLevel * zoomFactor))
        const newVbWidth = vbWidth * (zoomLevel / newZoomLevel)
        const newVbHeight = vbHeight * (zoomLevel / newZoomLevel)
        const centerX = vbX + vbWidth / 2
        const centerY = vbY + vbHeight / 2
        const newVbX = Math.max(origX, Math.min(centerX - newVbWidth / 2, origX + origWidth - vbWidth))
        const newVbY = Math.max(origY, Math.min(centerY - newVbHeight / 2, origY + origHeight - vbHeight))
        setViewBox(`${newVbX} ${newVbY} ${newVbWidth} ${newVbHeight}`)
        setZoomLevel(newZoomLevel)
        setLastTouchDistance(newDistance)
      }
    })
  }, [isPanning, lastMousePos, lastTouchDistance, viewBox, viewbox, zoomLevel])

  const handleTouchEnd = useCallback(() => {
    setIsPanning(false)
    setLastMousePos(null)
    setLastTouchDistance(null)
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
  }, [])

  const handleSvgClick = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    if (event.target === svgRef.current || !['path', 'polygon'].includes((event.target as SVGElement).tagName)) {
      setActiveTooltipId(null)
    }
  }, [])

  // Allow browser scrolling outside SVG
  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const handleWrapperTouchStart = (event: TouchEvent) => {
      const target = event.target as Node
      if (svgRef.current && svgRef.current.contains(target)) {
        event.stopPropagation()
      }
    }

    const handleWrapperTouchMove = (event: TouchEvent) => {
      const target = event.target as Node
      if (svgRef.current && svgRef.current.contains(target)) {
        event.stopPropagation()
      }
    }

    wrapper.addEventListener('touchstart', handleWrapperTouchStart, { passive: false })
    wrapper.addEventListener('touchmove', handleWrapperTouchMove, { passive: false })

    return () => {
      wrapper.removeEventListener('touchstart', handleWrapperTouchStart)
      wrapper.removeEventListener('touchmove', handleWrapperTouchMove)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setActiveTooltipId(null)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  useEffect(() => {
    getBlockTypes()
    const checkMobileAndOrientation = () => {
      const mobile = window.innerWidth <= 1366
      setIsMobile(mobile)
    }
    checkMobileAndOrientation()
    const resizeListener = debounce(checkMobileAndOrientation, 50)
    window.addEventListener('resize', resizeListener)
    return () => {
      window.removeEventListener('resize', resizeListener)
    }
  }, [getBlockTypes])

  useEffect(() => {
    const preventGestureZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault()
    }
    document.addEventListener('touchmove', preventGestureZoom, { passive: false })
    return () => document.removeEventListener('touchmove', preventGestureZoom)
  }, [])

  if (isLoading) return <LoadingScreen />

  return (
    <div ref={ref} className="svg-block relative h-screen w-full" style={{ overscrollBehavior: 'none' }}>
      <div className="fixed top-0 left-0 right-0 px-4 py-2 md:px-16 md:py-4 flex justify-between items-center z-20">
        <div className="flex gap-4 items-center justify-center">
          <Button
            variant="default"
            onClick={() => setIsMenuOpen(true)}
            className="bg-[#F5F4DA] text-[#0D477C] px-4 py-2 rounded hover:scale-110 transition-all duration-300"
          >
            <AlignLeft />
          </Button>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm theo mã căn..."
            className="px-3 py-2 border border-gray-300 rounded text-black h-10 md:block hidden"
          />
        </div>
        {logo && (
          <Image
            src={getBackgroundUrl(logo)}
            alt="Logo"
            className="m-0 md:w-48 w-32"
            width={200}
            height={200}
            priority
          />
        )}
        {!isMobile && <ZoomControls zoomIn={zoomIn} zoomOut={zoomOut} />}
      </div>
      <p className="italic md:text-sm text-[7px] text-right md:w-[50%] w-full text-white fixed bottom-0 md:right-10 p-2 z-50">
        *những hình ảnh trong ấn phẩm này mang tính chất tham khảo, đây không được coi là cam kết hay một phần của bản chào giá hoặc hợp đồng, các thông số, hình ảnh có thể được thay đổi bởi cơ quan Nhà nước có thẩm quyền hoặc Chủ Đầu Tư do yêu cầu thực tế thay đổi*
      </p>
      <div
        ref={wrapperRef}
        className={`w-full ${isMobile ? 'h-screen overflow-x-scroll overflow-y-hidden -webkit-overflow-scrolling-touch' : 'h-full overflow-auto'}`}
      >
        <div
          ref={tooltipMeasureRef}
          className="absolute invisible pointer-events-none"
          style={{ width: TOOLTIP_WIDTH }}
        >
          {activeTooltipId && getVisibleItems.find((svg) => svg.id === activeTooltipId) && (
            <div className="bg-white p-1 rounded-xl border-white border-2 text-sm">
              <div className="bg-blue-900 p-2 text-white font-bold text-center rounded-t-lg">
                {getVisibleItems.find((svg) => svg.id === activeTooltipId)?.title || 'N/A'}
                <div className="text-xs font-base">
                  {getVisibleItems.find((svg) => svg.id === activeTooltipId)?.blocktype?.title || 'N/A'}
                </div>
              </div>
              <div className="bg-white text-black p-2">
                <div className="text-black">
                  Diện tích đất: <strong className="text-black">
                    {getVisibleItems.find((svg) => svg.id === activeTooltipId)?.dientichdat ||
                      (getVisibleItems.find((svg) => svg.id === activeTooltipId)?.blocktype?.dientichdat || 'N/A')}
                  </strong>
                </div>
                <div className="text-black">
                  Diện tích sàn: <strong className="text-black">
                    {getVisibleItems.find((svg) => svg.id === activeTooltipId)?.dientichsanxaydung ||
                      (getVisibleItems.find((svg) => svg.id === activeTooltipId)?.blocktype?.dientichsanxaydung || 'N/A')}
                  </strong>
                </div>
              </div>
              <Button
                onClick={() => {
                  setIsOpen(true)
                  setSelectedSVGItem(getVisibleItems.find((svg) => svg.id === activeTooltipId) || null)
                }}
                className="block bg-[#F5F4DA] w-full text-[#0D477C] hover:bg-amber-300 text-xs py-1"
              >
                Xem chi tiết
              </Button>
            </div>
          )}
        </div>
        <svg
          id={id || 'svg-block'}
          data-name={title}
          ref={svgRef}
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          viewBox={viewBox}
          className="min-w-full min-h-full w-auto h-auto"
          style={{ touchAction: isMobile ? 'pan-x' : 'pinch-zoom', willChange: 'transform' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={handleSvgClick}
        >
          <defs>
            <filter id="drop-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
              <feOffset dx="2" dy="2" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.5" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {!isPanning && (activeTooltipId || selectedBlocktype || searchQuery) && (
              <mask id="hoverMask">
                <rect
                  x={viewBox.split(' ')[0]}
                  y={viewBox.split(' ')[1]}
                  width={viewBox.split(' ')[2]}
                  height={viewBox.split(' ')[3]}
                  fill="white"
                />
                {getVisibleItems.map((svg) =>
                  (svg.id === activeTooltipId || (selectedBlocktype && (isBlocktypeInSelectedGroup(svg.blocktype as Blocktype) || (searchQuery && svg.title && svg.title.toLowerCase().includes(searchQuery.toLowerCase()))))) &&
                  (svg.type === 'path' && svg.path ? (
                    <path key={svg.id} d={svg.path} fill="black" />
                  ) : svg.points ? (
                    <polygon key={svg.id} points={svg.points} fill="black" />
                  ) : null)
                )}
              </mask>
            )}
          </defs>
          <image
            href={getBackgroundUrl(background)}
            width={width || 0}
            height={height || 0}
            transform={transform || ''}
            style={{ zIndex: 1 }}
            onLoad={() => setIsLoading(false)}
          />
          <rect
            x={viewBox.split(' ')[0]}
            y={viewBox.split(' ')[1]}
            width={viewBox.split(' ')[2]}
            height={viewBox.split(' ')[3]}
            fill={(activeTooltipId || selectedBlocktype || searchQuery) && !isPanning ? 'rgba(0, 0, 0, 0.5)' : 'none'}
            pointerEvents="none"
            mask={(activeTooltipId || selectedBlocktype || searchQuery) && !isPanning ? 'url(#hoverMask)' : undefined}
          />
          {getVisibleItems.map((svg) => (
            <SVGItemComponent
              key={svg.id}
              svg={svg as SVGItem}
              logo={logo as Media}
              isMobile={isMobile}
              selectedBlocktype={selectedBlocktype}
              activeTooltipId={activeTooltipId}
              isBlocktypeInSelectedGroup={isBlocktypeInSelectedGroup}
              getPointerEvents={getPointerEvents}
              setActiveTooltipId={setActiveTooltipId}
              searchQuery={searchQuery}
            />
          ))}
          {getVisibleItems.map((svg) => (
            svg.id === activeTooltipId && getTooltipContent(svg as SVGItem)
          ))}
        </svg>
      </div>
      {selectedSVGItem && (
        <ModalSVGBlock
          isOpen={isOpen}
          closeModal={() => setIsOpen(false)}
          svgItem={selectedSVGItem}
          checkCanBlock={checkCanBlock as any}
          svg={getVisibleItems as SVGItem[]}
          isMobile={isMobile}
          selectedBlocktype={selectedBlocktype}
          activeTooltipId={activeTooltipId}
          isBlocktypeInSelectedGroup={isBlocktypeInSelectedGroup}
          getPointerEvents={getPointerEvents}
          setActiveTooltipId={setActiveTooltipId}
          viewBox={viewBox}
          background={background as Media}
          width={width || 0}
          height={height || 0}
          transform={transform || ''}
          searchQuery={searchQuery}
        />
      )}
      {isMenuOpen && (
        <Menu
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          groupNames={groupNames}
          selectedBlocktype={selectedBlocktype}
          setSelectedBlocktype={setSelectedBlocktype}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      )}
    </div>
  )
}

SVGBlock.displayName = 'SVGBlock'
export default React.memo(SVGBlock)