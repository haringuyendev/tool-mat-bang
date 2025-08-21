'use client';
import React, { useRef, useEffect, forwardRef } from 'react';
import Image from 'next/image';
import SVGItemComponent from '../SVGBlock/SVGItemComponent';
import { SVGItem } from '../SVGBlock/Component';
import type { CheckCanBlock as CheckCanBlockProps, Media } from '@/payload-types';

// Utility to escape CSS selectors for invalid IDs
const escapeCSSSelector = (id: string) => {
    // Escape digits at the start and special characters
    return id.replace(/^(\d)|([^\w-])/g, (match, digit) => (digit ? `\\3${digit} ` : `\\${match}`));
};

interface ExportComponentProps {
    checkCanBlock: CheckCanBlockProps;
    thongtincan: {
        maCan: string;
        type: string;
        dientichdat: string;
        dientichsanxaydung: string;
        giaBan: string;
        viewmatbang: { image: string | Media; id?: string }[];
    };
    svgItemProps: {
        svgItem: SVGItem;
        svg: SVGItem[];
        viewBox: string;
        background: Media;
        width: number;
        height: number;
        transform: string;
    };
}

const ExportComponent = forwardRef<HTMLDivElement, ExportComponentProps>(({ checkCanBlock, thongtincan, svgItemProps }, ref) => {
    const { backgroundAnh, chinhsach, logos } = checkCanBlock;
    const { maCan, type, dientichdat, dientichsanxaydung, giaBan, viewmatbang } = thongtincan;
    const { svgItem, svg, viewBox, background, width, height, transform } = svgItemProps;

    const svgRef = useRef<SVGSVGElement>(null);
    const [tooltipPosition, setTooltipPosition] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });

    // Find the SVG item to highlight
    const highlightedItem = svgItem.title === maCan || svgItem.id === maCan ? svgItem : svg.find((item) => item.title === maCan || item.id === maCan);

    // Calculate component position based on highlighted item's bounding box
    useEffect(() => {
        if (!svgRef.current || !highlightedItem) {
            setTooltipPosition({ x: 0, y: 0 }); // Fallback position
            return;
        }

        const svgElement = svgRef.current;
        const escapedId = escapeCSSSelector(highlightedItem.id);
        const itemElement = svgElement.querySelector(`#${escapedId}`);
        if (itemElement) {
            try {
                const bbox = (itemElement as SVGGraphicsElement).getBBox();
                const centroidX = bbox.x + bbox.width / 2;
                const centroidY = bbox.y; // Place component above the item
                setTooltipPosition({ x: centroidX, y: centroidY - 10 }); // Offset slightly above
            } catch (err) {
                console.error('Error calculating component position:', err);
                setTooltipPosition({ x: 0, y: 0 }); // Fallback position
            }
        } else {
            console.warn(`Element with ID ${highlightedItem.id} not found`);
            setTooltipPosition({ x: 0, y: 0 }); // Fallback position
        }
    }, [highlightedItem]);

    // Get URL for images
    const getUrl = (item: any): string => {
        if (typeof item === 'string') return item;
        if (typeof item === 'object' && item !== null && 'url' in item) return item.url || '';
        return '';
    };

    // SVG-based component content
    const getComponentContent = (item: SVGItem) => (
        <g>
            {/* White background rectangle */}
            <rect
                x={tooltipPosition.x - 100}
                y={tooltipPosition.y - 110}
                width="200"
                height="100"
                fill="white"
                stroke="white"
                strokeWidth="2"
            />
            {/* Blue header rectangle */}
            <rect
                x={tooltipPosition.x - 100}
                y={tooltipPosition.y - 110}
                width="200"
                height="30"
                fill="#1E3A8A" // bg-blue-900
            />
            {/* Header text */}
            <text
                x={tooltipPosition.x}
                y={tooltipPosition.y - 90}
                fontSize="12"
                fontWeight="bold"
                fill="white"
                textAnchor="middle"
                dominantBaseline="middle"
            >
                {item.title || 'N/A'}
            </text>
            {/* Diện tích đất */}
            <text
                x={tooltipPosition.x - 90}
                y={tooltipPosition.y - 60}
                fontSize="12"
                fill="black"
            >
                Diện tích đất: <tspan fontWeight="bold">{item.dientichdat || (item.blocktype?.dientichdat || 'N/A')}</tspan>
            </text>
            {/* Diện tích sàn */}
            <text
                x={tooltipPosition.x - 90}
                y={tooltipPosition.y - 40}
                fontSize="12"
                fill="black"
            >
                Diện tích sàn: <tspan fontWeight="bold">{item.dientichsanxaydung || (item.blocktype?.dientichsanxaydung || 'N/A')}</tspan>
            </text>
        </g>
    );

    return (
        <div
            ref={ref}
            className="relative bg-white text-blue-900"
            style={{
                width: '964px',
                height: '1728px',
                fontFamily: 'sans-serif',
                paddingBottom: '2rem',
            }}
        >
            <div className="relative w-full">
                {backgroundAnh && (
                    <div>
                        {backgroundAnh.map((item, index) => (
                            <Image
                                key={index}
                                src={getUrl(item.image) || ''}
                                className="w-full h-auto object-contain m-0"
                                alt="background"
                                width={964}
                                height={1728}
                                loading="eager"
                                priority
                            />
                        ))}
                    </div>
                )}
                <div className="absolute top-24 w-full flex justify-between items-center px-2 my-4">
                    {logos?.map((logo) => (
                        <Image
                            key={logo.id}
                            height={74}
                            width={206}
                            src={getUrl(logo.image) || ''}
                            alt={logo.label || 'Logo'}
                            className="h-12 shrink-0 object-contain"
                            loading="eager"
                            priority
                        />
                    ))}
                </div>
                {/* SVG and Annotations */}
                <div className="grid grid-cols-12 w-full font-utmBold px-10 py-4 bg-transparent absolute items-center justify-center top-48">

                    <div className="col-span-12 border border-green-900 p-4 rounded-2xl flex items-center justify-between gap-4 mb-3">
                        <div className="flex-1 flex flex-col items-left text-left gap-2">
                            <div className="text-green-900 space-y-1">
                                <p className="font-utmBold text-green-900 text-xl ">{type}</p>
                                <p className="font-utmBold text-green-900 text-4xl mt-1 ">
                                    Mã căn: {maCan}
                                </p>
                                <p className="m-0 text-base ">Diện tích đất: {dientichdat}</p>
                                <p className="m-0 text-base ">Diện tích sàn: {dientichsanxaydung}</p>
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col gap-1 justify-center text-center">
                            <p className="font-bold text-green-900 text-6xl mb-2 ">
                                {giaBan || 'N/A'}
                            </p>
                            <p className="font-bold text-green-900 text-base m-0 ">
                                (GIÁ CHƯA BAO GỒM VAT &amp; KPBT)
                            </p>
                        </div>
                    </div>
                    {viewmatbang && viewmatbang.map((item, index) => (
                        <div key={index} className="w-full col-span-12 h-auto rounded-lg" style={{ bottom: '1%', right: '1%' }}>
                            <Image
                                src={getUrl(item.image) || ''}
                                className="md:border-4 border-2 border-white md:rounded-3xl rounded-xl w-full h-full object-contain"
                                alt="View ảnh"
                                width={324}
                                height={186}
                                loading="eager"
                                priority
                            />
                        </div>
                    ))}
                    {/* SVG */}
                    <div className="col-span-12 w-full relative mt-2">
                        <svg
                            id={svgItem.id || 'svg-block'}
                            data-name={svgItem.title}
                            xmlns="http://www.w3.org/2000/svg"
                            xmlnsXlink="http://www.w3.org/1999/xlink"
                            viewBox={viewBox}
                            className="min-w-full min-h-full w-auto h-auto"
                            ref={svgRef}
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
                                {highlightedItem && (
                                    <mask id="highlightMask">
                                        <rect
                                            x={viewBox.split(' ')[0]}
                                            y={viewBox.split(' ')[1]}
                                            width={viewBox.split(' ')[2]}
                                            height={viewBox.split(' ')[3]}
                                            fill="white"
                                        />
                                        {highlightedItem.type === 'path' && highlightedItem.path ? (
                                            <path d={highlightedItem.path} fill="black" />
                                        ) : highlightedItem.points ? (
                                            <polygon points={highlightedItem.points} fill="black" />
                                        ) : null}
                                    </mask>
                                )}
                            </defs>
                            <image
                                href={getUrl(background) || getUrl(backgroundAnh?.[0]?.image)}
                                width={width || 0}
                                height={height || 0}
                                transform={transform || ''}
                                style={{ zIndex: 1 }}
                            />
                            {highlightedItem && (
                                <rect
                                    x={viewBox.split(' ')[0]}
                                    y={viewBox.split(' ')[1]}
                                    width={viewBox.split(' ')[2]}
                                    height={viewBox.split(' ')[3]}
                                    fill="rgba(0, 0, 0, 0.5)"
                                    pointerEvents="none"
                                    mask="url(#highlightMask)"
                                />
                            )}
                            {svg.map((item) => (
                                <SVGItemComponent
                                    key={item.id}
                                    svg={item}
                                    logo={undefined}
                                    isMobile={false}
                                    selectedBlocktype={null}
                                    activeTooltipId={null}
                                    isBlocktypeInSelectedGroup={() => false}
                                    getPointerEvents={() => 'all'}
                                    setActiveTooltipId={() => { }}
                                    isSelected={highlightedItem?.id === item.id}
                                />
                            ))}
                            {/* Connecting Line */}
                            {highlightedItem && (
                                <line
                                    x1={tooltipPosition.x}
                                    y1={tooltipPosition.y + 15}
                                    x2={tooltipPosition.x}
                                    y2={tooltipPosition.y - 10}
                                    stroke="white"
                                    strokeWidth="3"
                                />
                            )}
                            {/* SVG-based Component */}
                            {highlightedItem && getComponentContent(highlightedItem)}

                        </svg>
                        {/* Chinhsach Image */}
                        {chinhsach && typeof chinhsach === 'object' && (
                            <Image
                                src={getUrl(chinhsach) || ''}
                                className="object-contain"
                                alt="Chính sách"
                                width={250}
                                height={250}
                                style={{
                                    position: 'absolute',
                                    left: `4%`,
                                    bottom: `3%`,
                                    zIndex: 2,
                                }}
                                loading="eager"
                                priority
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

ExportComponent.displayName = 'ExportComponent';
export default ExportComponent;