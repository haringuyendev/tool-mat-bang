import { Media } from "@/payload-types"

export const parsePathBounds = (path: string | null | undefined) => {
  if (!path || path.trim() === '') return { minX: 0, minY: 0, maxX: 0, maxY: 0 }
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  let currentX = 0, currentY = 0

  const commands = path.match(/[MLHVCSQTAZmlhvcsqtaz][^MLHVCSQTAZmlhvcsqtaz]*/g) || []
  for (const cmd of commands) {
    try {
      const type = cmd[0]
      const nums = cmd.slice(1).trim().split(/[\s,]+/).map(Number).filter(isFinite)
      switch (type) {
        case 'M': case 'm':
          currentX = type === 'm' ? currentX + (nums[0] || 0) : nums[0]
          currentY = type === 'm' ? currentY + (nums[1] || 0) : nums[1]
          break
        case 'L': case 'l':
          currentX = type === 'l' ? currentX + (nums[0] || 0) : nums[0]
          currentY = type === 'l' ? currentY + (nums[1] || 0) : nums[1]
          break
        case 'C': case 'c':
          currentX = type === 'c' ? currentX + (nums[4] || 0) : nums[4]
          currentY = type === 'c' ? currentY + (nums[5] || 0) : nums[5]
          break
        case 'Q': case 'q':
          currentX = type === 'q' ? currentX + (nums[2] || 0) : nums[2]
          currentY = type === 'q' ? currentY + (nums[3] || 0) : nums[3]
          break
        case 'H': case 'h':
          currentX = type === 'h' ? currentX + (nums[0] || 0) : nums[0]
          break
        case 'V': case 'v':
          currentY = type === 'v' ? currentY + (nums[0] || 0) : nums[0]
          break
      }
      if (isFinite(currentX) && isFinite(currentY)) {
        minX = Math.min(minX, currentX)
        minY = Math.min(minY, currentY)
        maxX = Math.max(maxX, currentX)
        maxY = Math.max(maxY, currentY)
      }
    } catch {
      // Silent error handling
    }
  }
  return isFinite(minX) ? { minX, minY, maxX, maxY } : { minX: 0, minY: 0, maxX: 0, maxY: 0 }
}

export const parsePolygonBounds = (points: string | null | undefined) => {
  if (!points || points.trim() === '') return { minX: 0, minY: 0, maxX: 0, maxY: 0 }
  const coords = points.split(/[\s,]+/).map(Number).filter(isFinite)
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

  for (let i = 0; i < coords.length; i += 2) {
    const x = coords[i]
    const y = coords[i + 1]
    if (isFinite(x) && isFinite(y)) {
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)
    }
  }
  return isFinite(minX) ? { minX, minY, maxX, maxY } : { minX: 0, minY: 0, maxX: 0, maxY: 0 }
}

export const getBackgroundUrl = (background: string | Media | null | undefined) => {
  if (typeof background === 'string') return background
  return background?.url || ''
}

