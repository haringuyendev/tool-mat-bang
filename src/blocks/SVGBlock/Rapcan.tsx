'use client';
import React, { useRef } from 'react';
import Image from 'next/image';

type ExportImageProps = {
    ref: any,
    data: {
        maCan: string;
        type: string;
        background_image: string;
        viewanh: string;
        matbangImages: string;
        dienTichTimTuong: string;
        dienTichThongThuy: string;
        tamView: string;
        giaBan: string;
    };
    backgroundImageUrl?: string;
    matbangImageUrl?: string;
    viewanhUrl?: string;
    viewcan?: any;
    position?: { x: number; y: number };
    rotate?: number;
    previewWidth?: number;
    previewHeight?: number;
    chinhsach?: any;
    logos: string[]; // Danh sách URL ảnh logo
};

const ExportImage: React.FC<ExportImageProps> = ({
    data,
    backgroundImageUrl = '',
    matbangImageUrl = '',
    viewanhUrl = '',
    viewcan,
    position = { x: 0, y: 0 },
    rotate = 0,
    previewWidth = 1008,
    previewHeight = 1378,
    chinhsach,
    logos = [],
    ref
}) => {
    const getUrl = (item: any): string => {
        if (typeof item === 'string') return item;
        if (typeof item === 'object' && item !== null && 'url' in item) return item.url || '';
        return '';
    };
    const containerRef = useRef<HTMLDivElement>(null);
    const ratio = previewWidth / previewHeight;
    const exportWidth = 1008;
    const exportHeight = exportWidth / ratio;

    const scaleX = previewWidth ? exportWidth / previewWidth : 1;
    const scaleY = previewHeight ? exportHeight / previewHeight : 1;

    const scaledPosition = {
        x: (position?.x || 0) * scaleX,
        y: (position?.y || 0) * scaleY,
    };
    return (
        <div ref={ref}
            className="relative bg-white text-blue-900"
            style={{
                width: '1008px',
                height: '1370px',
                fontFamily: 'sans-serif',
                paddingBottom: '2rem',
            }}
        >
            <div ref={containerRef} className="relative w-full">
                {backgroundImageUrl && (
                    <div>
                        <Image
                            src={backgroundImageUrl}
                            className="w-full h-auto object-contain m-0"
                            alt="background"
                            width={1008}
                            height={904}
                            loading="eager"
                            priority
                        />
                    </div>
                )}
                <div className="absolute top-1 w-full flex justify-between items-center px-2">
                    {logos?.map((logo) => (
                        <Image
                            key={logo}
                            height={48}
                            width={206}
                            src={getUrl(logo) || ''}
                            alt={logo || 'Logo'}
                            className="h-12 shrink-0 object-contain"
                            loading="eager"
                            priority
                        />
                    ))}
                </div>
                {viewcan?.image && (
                    <div
                        style={{
                            position: 'absolute',
                            top: `${scaledPosition.y}px`,
                            left: `${scaledPosition.x}px`,
                            cursor: 'move',
                            transform: `rotate(${rotate}deg)`,
                        }}
                        className='w-[20%]  z-10'
                    >
                        <Image
                            src={getUrl(viewcan?.image) || ''}
                            alt="View căn"
                            width={viewcan?.width || 200}
                            height={viewcan?.height || 200}
                            className="object-contain w-full"
                            loading="eager"
                            priority
                        />
                    </div>
                )}
                <div className="grid grid-cols-12 w-full items-center justify-between font-utmBold lg:px-10 lg:py-4 px-6 py-2 bg-transparent absolute top-[5rem]">
                    <div className="col-span-6 flex flex-col md:gap-4 gap-1">
                        <p className="font-bold text-golden my-2 md:text-4xl text-base">Mã căn {data.maCan}</p>
                         <div className="flex flex-col text-white gap-4 md:my-2 my-1">
                            <div className="py-2 px-6 border-y-2 flex items-center md:text-4xl text-sm font-magire font-thin border-white whitespace-nowrap shrink-0 w-fit">
                                Loại căn: {data.type || 'STUDIO'}
                            </div>
                            <div className="flex flex-col gap-2 font-thin text-base">
                                <p className="m-0">Diện tích tim tường: {data.dienTichTimTuong}m²</p>
                                <p className="m-0">Diện tích thông thủy: {data.dienTichThongThuy}m²</p>
                                <p className="m-0">Tầm view: {data.tamView}</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-6 flex gap-2 flex-col items-center justify-center">
                        {matbangImageUrl && (
                            <Image
                                src={matbangImageUrl || ''}
                                className="object-contain m-0"
                                alt=""
                                width={464}
                                height={368}
                                loading="eager"
                                priority
                            />

                        )}
                        <div
                            className="font-magire m-0 md:my-2 my-1 md:p-[0.2rem] p-[0.1rem] text-center rounded-2xl md:text-3xl text-bold golden-border"
                        >
                            <div className="bg-green-900 relative w-full rounded-xl p-2">
                                <div className="font-bold text-white">Giá bán</div>
                                <div className="font-thin text-[1rem] m-0 text-white">(Chưa VAT & PBT)</div>
                                <div className="font-bold text-golden italic text-5xl">{data.giaBan}</div>
                            </div>
                        </div>


                    </div>

                </div>
            </div>
            <div className="col-span-12 rounded-t-3xl m-0 -translate-y-[2rem] shadow-[0px_-10px_6px_0px_rgba(0,0,0,0.5)]">
                {chinhsach && typeof chinhsach === 'object' && (
                    <Image
                        src={getUrl(chinhsach) || ''}
                        className="object-contain max-w-full m-0"
                        alt=""
                        width={1008}
                        height={475}
                        loading="eager"
                        priority
                    />
                )}
            </div>
        </div>
    );
};

export default ExportImage;
