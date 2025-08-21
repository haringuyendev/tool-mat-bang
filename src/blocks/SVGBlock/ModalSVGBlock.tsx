import Image from "next/image";
import { SVGItem } from "./Component";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getBackgroundUrl } from "./utils";
import Link from "next/link";
import { Blocktype, CheckCanBlock as CheckCanBlockProps, Media } from "@/payload-types";
import { CheckCanBlock } from "../CheckCanBlock/Component";
interface ModalSVGBlockProps {
  isOpen: boolean;
  closeModal: () => void;
  svgItem: SVGItem;
  checkCanBlock: any;
  svg: SVGItem[];
  isMobile: boolean;
  viewBox: string;
  background: Media;
  width: number;
  height: number;
  transform: string;
  selectedBlocktype: string | null;
  activeTooltipId: string | null;
  isBlocktypeInSelectedGroup: (blocktype: Blocktype | null) => boolean;
  getPointerEvents: (blocktype: Blocktype | null) => 'all' | 'none';
  setActiveTooltipId: (id: string | null) => void;
  searchQuery?: string;
}
export default function ModalSVGBlock({
  isOpen,
  closeModal,
  svgItem,
  checkCanBlock,
  svg,
  isMobile,
  selectedBlocktype,
  activeTooltipId,
  isBlocktypeInSelectedGroup,
  getPointerEvents,
  setActiveTooltipId,
  viewBox,
  background,
  width,
  height,
  transform,
  searchQuery
}: ModalSVGBlockProps) {
  console.log(svgItem)
  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] bg-[#fffaf5] text-[#224673] rounded-lg p-4 md:p-6 overflow-y-auto">
        <DialogHeader>

          <DialogDescription className="flex flex-col gap-4">

            {checkCanBlock && checkCanBlock.length > 0 ? <CheckCanBlock checkCanBlock={checkCanBlock[0]} thongtincan={{ maCan: svgItem?.title as string, type: svgItem?.blocktype?.title as string, viewmatbang: svgItem?.blocktype?.matbangImages as { image: string | Media; id?: string }[], dientichdat: svgItem?.dientichdat as string, dientichsanxaydung: svgItem?.dientichsanxaydung as string, giaBan: svgItem?.giaban as string }}
              svgItemProps={{
                svgItem,
                viewBox,
                background,
                svg,
                width,
                height,
                transform,
              }}
            /> : <>
              <div className="text-2xl mt-16 flex justify-between md:text-4xl px-4">
                <span className="font-bold">{svgItem?.title || "No Title"}</span>
                <p className="text-base font-semibold md:text-xl">
                  Diện tích đất: <span className="font-semibold">{svgItem?.dientichdat || svgItem?.blocktype?.dientichdat || "N/A"}</span>
                </p>
                <p className="text-base font-semibold md:text-xl">
                  Diện tích sàn: <span className="font-semibold">{svgItem?.dientichsanxaydung || svgItem?.blocktype?.dientichsanxaydung || "N/A"}</span>
                </p>
              </div>
              <div className="flex flex-col items-start gap-2">
                {svgItem?.price && (
                  <p className="text-xl md:text-4xl">
                    <span className="font-bold">{svgItem?.price} <sup>vnđ</sup></span>
                  </p>
                )}
                {svgItem?.status && (
                  <p className="text-xl md:text-4xl">
                    <span className="font-semibold text-xl">Trạng thái: {svgItem?.status}</span>
                  </p>
                )}
              </div>
              <div className="w-full h-auto">
                {svgItem?.blocktype?.matbangImages && svgItem?.blocktype?.matbangImages?.length > 0 ? (
                  <div className="flex w-full flex-col gap-4 p-2">
                    {svgItem?.blocktype?.matbangImages?.map((image, index) => (
                      <div key={index} className="relative">
                        <Image
                          src={getBackgroundUrl(image.image)}
                          alt={`${svgItem?.title || "Mặt bằng"} ${index + 1}`}
                          width={1920}
                          height={1080}
                          className="object-contain w-full h-full rounded-md"
                          sizes="100vw"
                        />
                      </div>
                    ))}
                  </div>
                ) : null}
                {svgItem?.viewImages && svgItem?.viewImages?.length === 0 && svgItem?.blocktype?.viewImages && svgItem?.blocktype?.viewImages?.length > 0 ? (
                  <div className="flex w-full flex-col gap-4 p-2">
                    {svgItem?.blocktype?.viewImages?.map((image, index) => (
                      <div key={index} className="relative">
                        <Image
                          src={getBackgroundUrl(image.image)}
                          alt={`${svgItem?.title || "Mặt bằng"} ${index + 1}`}
                          width={1920}
                          height={1080}
                          className="object-contain w-full h-full rounded-md"
                          sizes="100vw"
                        />
                      </div>
                    ))}
                  </div>
                ) : null}
                {svgItem?.viewImages && svgItem?.viewImages?.length > 0 ? (
                  <div className="flex w-full flex-col gap-4 p-2">
                    {svgItem?.viewImages?.map((image, index) => (
                      <div key={index} className="relative">
                        <Image
                          src={getBackgroundUrl(image.image)}
                          alt={`${svgItem?.title || "View Thực tế"} ${index + 1}`}
                          width={1920}
                          height={1080}
                          className="object-contain w-full h-full rounded-md"
                          sizes="100vw"
                        />
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
              </>}
              <div className="flex items-center justify-center md:text-2xl text-base text-[#193D1A] font-normal italic animate-bounce">
                {svgItem?.linkMatbang && (
                  <Link href={svgItem?.linkMatbang} className="mt-4" target="_blank">
                    Xem thông tin chi tiết bản vẽ thiết kế
                  </Link>
                )}
              </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}