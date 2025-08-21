import React, { useCallback } from "react"
import { SVGItem } from "./Component"
import { Blocktype } from "@/payload-types"
import { Media } from "@/payload-types"
interface SVGItemProps {
  svg: SVGItem
  isMobile?: boolean
  selectedBlocktype?: string | null
  activeTooltipId: string | null
  isBlocktypeInSelectedGroup: (blocktype: Blocktype | null) => boolean
  getPointerEvents: (blocktype: Blocktype | null) => 'all' | 'none'
  setActiveTooltipId: (id: string | null) => void
  logo?: Media | undefined
  searchQuery?: string
  isSelected?: boolean
}
export const SVGItemComponent: React.FC<SVGItemProps> = ({ svg, selectedBlocktype, activeTooltipId, searchQuery, isBlocktypeInSelectedGroup, getPointerEvents, setActiveTooltipId, isSelected }) => {
    const handleClick = useCallback(() => {
      setActiveTooltipId(activeTooltipId === svg.id ? null : svg.id)
    }, [activeTooltipId, setActiveTooltipId, svg.id])

    const isSelectedAndActive = selectedBlocktype && isBlocktypeInSelectedGroup(svg.blocktype as Blocktype) && activeTooltipId === svg.id
    const isHighlighted = isBlocktypeInSelectedGroup(svg.blocktype as Blocktype) || (searchQuery && svg.title && svg.title.toLowerCase().includes(searchQuery.toLowerCase()))

    return svg.type === 'path' && svg.path ? (
      <path
        id={svg.id}
        d={svg.path}
        fill={isSelectedAndActive ? 'rgba(255, 0, 0, 0.5)' : isHighlighted ? 'none' : 'none'}
        stroke={svg.stroke || (isSelected ? 'red' : isSelectedAndActive ? 'white' : 'none')}
        strokeWidth={svg['stroke-width'] || 1}
        pointerEvents={getPointerEvents(svg.blocktype as Blocktype)}
        className={isHighlighted ? 'selected' : activeTooltipId && activeTooltipId !== svg.id ? 'dimmed' : ''}
        onClick={handleClick}
        data-tooltip-id={svg.id}
        data-tooltip-place="top"
      />
    ) : svg.points ? (
      <polygon
        id={svg.id}
        points={svg.points}
        fill={isSelectedAndActive ? 'rgba(255, 0, 0, 0.5)' : isHighlighted ? 'none' : 'none'}
        stroke={svg.stroke || (isSelected ? 'red' : isSelectedAndActive ? 'white' : 'none')}
        strokeWidth={svg['stroke-width'] || 1}
        pointerEvents={getPointerEvents(svg.blocktype as Blocktype)}
        className={isHighlighted ? 'selected' : activeTooltipId && activeTooltipId !== svg.id ? 'dimmed' : ''}
        onClick={handleClick}
        data-tooltip-id={svg.id}
        data-tooltip-place="top"
      />
    ) : null
  }
export default React.memo(SVGItemComponent)
