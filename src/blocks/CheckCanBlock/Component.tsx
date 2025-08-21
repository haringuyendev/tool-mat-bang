'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { CheckCanBlock as CheckCanBlockProps, Media } from '@/payload-types';
import { Button } from '@payloadcms/ui';
import Image from 'next/image';
import { toBlob } from 'html-to-image';
import SVGItemComponent from '../SVGBlock/SVGItemComponent';
import { SVGItem } from '../SVGBlock/Component';
import ExportComponent from './ExportComponent';

// Utility to escape CSS selectors for invalid IDs
const escapeCSSSelector = (id: string) => {
    return id.replace(/^(\d)|([^\w-])/g, (match, digit) => (digit ? `\\3${digit} ` : `\\${match}`));
};

interface Props {
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

export const CheckCanBlock: React.FC<Props> = ({ checkCanBlock, thongtincan, svgItemProps }) => {
    const { backgroundAnh, chinhsach, logos } = checkCanBlock;
    const { maCan, type, dientichdat, dientichsanxaydung, giaBan, viewmatbang } = thongtincan;
    const { svgItem, svg, viewBox, background, width, height, transform } = svgItemProps;

    const [downloading, setDownloading] = useState(false);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

    const imageRef = useRef<HTMLImageElement>(null);
    const exportComponentRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    // Find the SVG item to highlight
    const highlightedItem =
        svgItem.title === maCan || svgItem.id === maCan
            ? svgItem
            : svg.find((item) => item.title === maCan || item.id === maCan);

    // Recalculate tooltip position in viewBox units and clamp within bounds
    useEffect(() => {
        if (!svgRef.current || !highlightedItem) {
            setTooltipPosition({ x: 0, y: 0 });
            return;
        }
        const svgElement = svgRef.current;
        const escapedId = escapeCSSSelector(highlightedItem.id);
        const itemElement = svgElement.querySelector<SVGGraphicsElement>(`#${escapedId}`);
        const [vbX, vbY, vbW, vbH] = viewBox.split(' ').map(Number);

        if (itemElement) {
            try {
                const bbox = itemElement.getBBox();
                let cx = bbox.x + bbox.width / 2;
                let cy = bbox.y; // above the item
                // Tooltip foreignObject size (in viewBox units) ~200x100 mapped to viewBox width/height.
                // We map 200/100 px to ~ (vbW * 200 / svgPixelWidth) etc. But we place by center with a fixed offset.
                const foW = (vbW * 200) / (width || vbW); // approximate
                const foH = (vbH * 100) / (height || vbH);

                // Clamp so tooltip stays onscreen
                cx = Math.max(vbX + foW / 2, Math.min(cx, vbX + vbW - foW / 2));
                cy = Math.max(vbY + 0, Math.min(cy, vbY + vbH - foH));

                setTooltipPosition({ x: cx, y: cy - (vbH * 10) / (height || vbH) });
            } catch (err) {
                console.error('Error calculating component position:', err);
                setTooltipPosition({ x: 0, y: 0 });
            }
        } else {
            console.warn(`Element with ID ${highlightedItem.id} not found`);
            setTooltipPosition({ x: 0, y: 0 });
        }
    }, [highlightedItem, viewBox, width, height]);

    // Re-run position on resize to keep things aligned when aspect ratio changes
    useEffect(() => {
        const onResize = () => {
            // Trigger effect by touching state deps; simplest is re-setting same item
            setTooltipPosition((p) => ({ ...p }));
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // Component content (HTML-based for UI)
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

    // Handle image load — mark loaded once the background and all logos report onLoad
    const loadedCount = useRef(0);
    const totalToLoad = (backgroundAnh?.length || 0) + (logos?.length || 0);

    const handleAnyImageLoad = useCallback(() => {
        loadedCount.current += 1;
        if (loadedCount.current >= totalToLoad) setImagesLoaded(true);
    }, [totalToLoad]);

    // Handle download
    const handleDownload = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            if (!exportComponentRef.current) return;
            setDownloading(true);
            try {
                const blob = await toBlob(exportComponentRef.current, {
                    pixelRatio: 1, // đẹp hơn cho mobile retina
                    cacheBust: true,
                    includeQueryParams: true,
                });
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${maCan || 'can-ho'}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    setTimeout(() => URL.revokeObjectURL(url), 3000);
                }
            } catch (err) {
                console.error('Lỗi xuất ảnh:', err);
            }
            setDownloading(false);
        },
        [maCan],
    );

    // Get URL for images
    const getUrl = (item: any): string => {
        if (typeof item === 'string') return item;
        if (typeof item === 'object' && item !== null && 'url' in item) return (item as any).url || '';
        return '';
    };

    const [vbX, vbY, vbW, vbH] = viewBox.split(' ').map(Number);


    return (
        <div className="flex flex-col items-center md:mt-[6rem] mt-8 px-3">
            <div className="md:w-2/3 w-full max-w-[948px] text-blue-900 canva-div">
                <div className="relative w-full">
                    {backgroundAnh && (
                        <div className="relative w-full">
                            {/* Background layers */}
                            {backgroundAnh.map((item, index) => (
                                <Image
                                    key={index}
                                    ref={index === 0 ? imageRef : undefined}
                                    src={getUrl(item.image) || ''}
                                    className="w-full h-auto object-contain m-0 select-none"
                                    alt="background"
                                    width={1920}
                                    height={3271}
                                    loading="eager"
                                    priority
                                    onLoad={handleAnyImageLoad}
                                />
                            ))}

                            {/* Logos — stack on mobile, spread on md+ */}
                            <div className="absolute top-6 md:top-24 w-full flex flex-nowrap gap-0 md:gap-4 items-center justify-between px-3 md:px-4">
                                {logos?.map((logo) => (
                                    <Image
                                        key={logo.id}
                                        height={74}
                                        width={206}
                                        src={getUrl(logo.image) || ''}
                                        alt={logo.label || 'Logo'}
                                        className="h-4 md:h-12 object-contain"
                                        loading="eager"
                                        priority
                                        onLoad={handleAnyImageLoad}
                                    />
                                ))}
                            </div>

                            {/* Content bar */}
                            <div className="grid grid-cols-12 w-full font-utmBold lg:px-8 lg:py-4 px-3 py-3 bg-transparent absolute items-start justify-center md:top-48 top-12">
                                <div className="col-span-12 border border-green-900 p-3 md:p-4 md:rounded-2xl rounded-xl flex md:items-center md:justify-between gap-3 md:gap-4 md:mb-3 mb-1">
                                    <div className="flex-1 flex flex-col items-left text-left gap-2">
                                        <div className="text-green-900 space-y-1">
                                            <p className="font-utmBold text-green-900 text-[5px] md:text-xl leading-[1] md:leading-unset">{type}</p>
                                            <p className="font-utmBold text-green-900 text-[7px] md:text-4xl mt-1 leading-[1] md:leading-unset">
                                                Mã căn: {maCan}
                                            </p>
                                            <p className="m-0 text-[6px] md:text-base leading-[1] md:leading-unset">Diện tích đất: {dientichdat}</p>
                                            <p className="m-0 text-[6px] md:text-base leading-[1] md:leading-unset">Diện tích sàn: {dientichsanxaydung}</p>
                                        </div>
                                    </div>
                                    <div className="flex-1 flex flex-col gap-1 justify-center text-center">
                                        <p className="font-bold text-green-900 text-[7px] md:text-3xl m-0 leading-[1] md:leading-unset">
                                            {giaBan || 'N/A'}
                                        </p>
                                        <p className="font-bold text-green-900 text-[6px] md:text-base m-0 leading-[1] md:leading-unset">
                                            (GIÁ CHƯA BAO GỒM VAT &amp; KPBT)
                                        </p>
                                    </div>
                                </div>

                                {/* View mặt bằng — responsive grid if many */}
                                {viewmatbang && viewmatbang.length > 0 && (
                                    <div className="col-span-12 grid grid-cols-12 gap-2">
                                        {viewmatbang.map((item, index) => (
                                            <div key={index} className="col-span-12">
                                                <Image
                                                    src={getUrl(item.image) || ''}
                                                    className="md:border-4 border-2 border-white md:rounded-3xl rounded-xl w-full h-auto object-contain"
                                                    alt="View ảnh"
                                                    width={324}
                                                    height={186}
                                                    loading="eager"
                                                    priority
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* SVG + Chính sách */}
                                <div className="col-span-12 w-full relative md:mt-3 mt-1">
                                    <div className="w-full">
                                        <svg
                                            id={svgItem.id || 'svg-block'}
                                            data-name={svgItem.title}
                                            xmlns="http://www.w3.org/2000/svg"
                                            xmlnsXlink="http://www.w3.org/1999/xlink"
                                            viewBox={viewBox}
                                            preserveAspectRatio="xMidYMid meet"
                                            className="w-full h-auto"
                                            ref={svgRef}
                                            style={{ position: 'relative', zIndex: 1, display: 'block' }}
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
                                                        <rect x={vbX} y={vbY} width={vbW} height={vbH} fill="white" />
                                                        {highlightedItem.type === 'path' && highlightedItem.path ? (
                                                            <path d={highlightedItem.path} fill="black" />
                                                        ) : highlightedItem.points ? (
                                                            <polygon points={highlightedItem.points} fill="black" />
                                                        ) : null}
                                                    </mask>
                                                )}
                                            </defs>

                                            {/* background image inside SVG */}
                                            <image
                                                href={getUrl(background) || getUrl(backgroundAnh?.[0]?.image)}
                                                width={width || vbW}
                                                height={height || vbH}
                                                transform={transform || ''}
                                                onLoad={handleAnyImageLoad}
                                                style={{ userSelect: 'none' }}
                                            />

                                            {/* dim everything except highlighted shape */}
                                            {highlightedItem && (
                                                <rect
                                                    x={vbX}
                                                    y={vbY}
                                                    width={vbW}
                                                    height={vbH}
                                                    fill="rgba(0,0,0,0.45)"
                                                    pointerEvents="none"
                                                    mask="url(#highlightMask)"
                                                />
                                            )}

                                            {/* interactive shapes */}
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
                                                />
                                            ))}
                                            {highlightedItem && (
                                                <line
                                                    x1={tooltipPosition.x}
                                                    y1={tooltipPosition.y + 10}
                                                    x2={tooltipPosition.x}
                                                    y2={tooltipPosition.y - 10}
                                                    stroke="white"
                                                    strokeWidth="3"
                                                />
                                            )}
                                            {/* Tooltip (foreignObject) — auto-clamped */}
                                            {highlightedItem && (

                                                getComponentContent(highlightedItem)
                                            )}
                                        </svg>
                                    </div>

                                    {/* Chính sách — góc trái dưới, co giãn */}
                                    {chinhsach && typeof chinhsach === 'object' && (
                                        <div className="absolute left-3 bottom-3 z-20 w-16 md:w-56">
                                            <Image
                                                src={getUrl(chinhsach) || ''}
                                                className="object-contain w-full h-auto"
                                                alt="Chính sách"
                                                width={250}
                                                height={250}
                                                loading="eager"
                                                priority
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Download Button — full width on mobile */}
                <div className="w-full p-3 md:p-4">
                    <form onSubmit={handleDownload}>
                        <div className="mb-3">
                            <Button type="submit" className="w-full py-3 rounded text-white bg-blue-600 hover:bg-blue-700">
                                {downloading ? 'Đang tải...' : 'Tải ảnh'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Hidden ExportComponent for toBlob (kích thước gốc để xuất nét) */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '1px',
                    height: '1px',
                    overflow: 'hidden',
                    opacity: 0,
                    transform: 'scale(0.01)',
                    pointerEvents: 'none',
                    zIndex: -999,
                }}
            >
                <ExportComponent
                    ref={exportComponentRef}
                    checkCanBlock={checkCanBlock}
                    thongtincan={thongtincan}
                    svgItemProps={svgItemProps}
                />
            </div>

            {downloading && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[9999]">
                    <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-white" />
                </div>
            )}
        </div>
    );
};
