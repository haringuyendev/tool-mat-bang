import { Button } from "@/components/ui/button";
import React from "react";

interface MenuProps {
    isMenuOpen: boolean
    setIsMenuOpen: (open: boolean) => void
    groupNames: string[]
    selectedBlocktype: string | null
    setSelectedBlocktype: (blocktype: string | null) => void
    searchQuery: string
    setSearchQuery: (query: string) => void
  }
export default function Menu({ isMenuOpen, setIsMenuOpen, groupNames, selectedBlocktype, setSelectedBlocktype, searchQuery, setSearchQuery }: MenuProps) {
    return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-30" onClick={() => setIsMenuOpen(false)}>
      <div
        className="menu fixed top-0 left-0 w-64 h-full bg-white shadow-lg p-4 overflow-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ transform: isMenuOpen ? 'translateX(0)' : 'translateX(-100%)' }}
      >
        <h2 className="text-lg font-bold mb-4">Chọn loại căn</h2>
        <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm theo mã căn..."
            className="md:hidden block px-3 py-2 my-2 w-full border border-gray-300 rounded text-black h-10"
          />
        <div className="space-y-2">
          {groupNames.map((groupName) => (
            <Button
              key={groupName}
              variant="default"
              onClick={() => {
                setSelectedBlocktype(groupName === 'Tất cả' ? null : groupName)
                setIsMenuOpen(false)
              }}
              className={`w-full text-left px-3 py-2 rounded hover:bg-blue-100 ${
                selectedBlocktype === groupName || (groupName === 'Tất cả' && selectedBlocktype === null) ? 'bg-blue-200 font-semibold' : ''
              }`}
            >
              {groupName}
            </Button>
          ))}
        </div>
      </div>
      
    </div>
  )
}