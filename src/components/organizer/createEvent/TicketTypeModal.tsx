import { Button, Checkbox, Input } from "@heroui/react";
import { X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { TicketTypeData } from "../../../types/organizerCreate";
import {
  OrganizerCountedInput,
  OrganizerCountedTextarea,
  OrganizerFieldLabel,
  OrganizerUploadBox,
} from "../OrganizerFormControls";

export default function TicketTypeModal({
  onClose,
  initialTicket,
  onSave,
}: {
  onClose: () => void;
  initialTicket: TicketTypeData | null;
  onSave: (ticket: TicketTypeData) => void;
}) {
  const { t } = useTranslation();
  const [ticketName, setTicketName] = useState(initialTicket?.name ?? "");
  const [price, setPrice] = useState(initialTicket?.price ?? "0");
  const [totalQuantity, setTotalQuantity] = useState(initialTicket?.totalQuantity ?? "10");
  const [minPerOrder, setMinPerOrder] = useState(initialTicket?.minPerOrder ?? "1");
  const [maxPerOrder, setMaxPerOrder] = useState(initialTicket?.maxPerOrder ?? "10");
  const [saleStart, setSaleStart] = useState(initialTicket?.saleStart ?? "");
  const [saleEnd, setSaleEnd] = useState(initialTicket?.saleEnd ?? "");
  const [description, setDescription] = useState(initialTicket?.description ?? "");
  const [isFree, setIsFree] = useState(initialTicket?.isFree ?? false);

  function handleSave() {
    const trimmedTicketName = ticketName.trim();
    if (trimmedTicketName.length < 3 || trimmedTicketName.length > 50) {
      window.alert("Ten ve phai tu 3 den 50 ky tu");
      return;
    }

    onSave({
      id: initialTicket?.id ?? Date.now(),
      name: trimmedTicketName,
      price: isFree ? "0" : price,
      isFree,
      totalQuantity,
      minPerOrder,
      maxPerOrder,
      saleStart,
      saleEnd,
      description,
    });
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
      <div className="max-h-[calc(100dvh-2rem)] w-full max-w-6xl overflow-y-auto rounded-lg border border-border bg-surface text-foreground shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-center border-b border-border bg-surface px-6 py-5">
          <h2 className="text-xl font-bold">
            {initialTicket
              ? t("organizer.create.ticketModal.editTitle", "Chỉnh sửa loại vé")
              : t("organizer.create.ticketModal.title", "Tạo loại vé mới")}
          </h2>
          <button
            type="button"
            className="absolute right-5 top-1/2 -translate-y-1/2 rounded-full p-2 text-muted transition-colors hover:bg-surface-secondary hover:text-foreground"
            aria-label={t("organizer.create.ticketModal.close", "Đóng")}
            onClick={onClose}
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="grid gap-7 p-6 md:p-8">
          <div className="space-y-2">
            <OrganizerFieldLabel>{t("organizer.create.ticketModal.ticketName", "Tên vé")}</OrganizerFieldLabel>
            <OrganizerCountedInput
              value={ticketName}
              maxLength={50}
              placeholder={t("organizer.create.ticketModal.ticketNamePlaceholder", "Tên vé")}
              onChange={setTicketName}
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(150px,186px)_minmax(160px,256px)_minmax(200px,1fr)_minmax(200px,1fr)]">
            <div className="space-y-2">
              <OrganizerFieldLabel>{t("organizer.create.ticketModal.price", "Giá vé")}</OrganizerFieldLabel>
              <Input
                type="number"
                value={isFree ? "0" : price}
                placeholder="0"
                disabled={isFree}
                onInput={(event) => setPrice(event.currentTarget.value)}
                className="w-full rounded-md border border-border bg-white text-slate-900 placeholder:text-danger"
              />
            </div>
            <div className="flex items-end pb-2">
              <Checkbox isSelected={isFree} onChange={setIsFree}>
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                <Checkbox.Content>
                  <span className="text-sm font-medium">
                    {t("organizer.create.ticketModal.free", "Miễn phí")}
                  </span>
                </Checkbox.Content>
              </Checkbox>
            </div>
            <div className="space-y-2">
              <OrganizerFieldLabel>{t("organizer.create.ticketModal.totalQuantity", "Tổng số lượng vé")}</OrganizerFieldLabel>
              <Input
                type="number"
                value={totalQuantity}
                onInput={(event) => setTotalQuantity(event.currentTarget.value)}
                className="w-full rounded-md border border-border bg-white text-slate-900"
              />
            </div>
            <div className="space-y-2">
              <OrganizerFieldLabel>
                {t("organizer.create.ticketModal.minPerOrder", "Số vé tối thiểu trong một đơn hàng")}
              </OrganizerFieldLabel>
              <Input
                type="number"
                value={minPerOrder}
                onInput={(event) => setMinPerOrder(event.currentTarget.value)}
                className="w-full rounded-md border border-border bg-white text-slate-900"
              />
            </div>
            <div className="space-y-2 lg:col-start-4">
              <OrganizerFieldLabel>
                {t("organizer.create.ticketModal.maxPerOrder", "Số vé tối đa trong một đơn hàng")}
              </OrganizerFieldLabel>
              <Input
                type="number"
                value={maxPerOrder}
                onInput={(event) => setMaxPerOrder(event.currentTarget.value)}
                className="w-full rounded-md border border-border bg-white text-slate-900"
              />
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-2">
              <OrganizerFieldLabel>{t("organizer.create.ticketModal.saleStart", "Thời gian bắt đầu bán vé")}</OrganizerFieldLabel>
              <Input
                type="datetime-local"
                value={saleStart}
                onInput={(event) => setSaleStart(event.currentTarget.value)}
                className="w-full rounded-md border border-border bg-white text-slate-900"
              />
            </div>
            <div className="space-y-2">
              <OrganizerFieldLabel>{t("organizer.create.ticketModal.saleEnd", "Thời gian kết thúc bán vé")}</OrganizerFieldLabel>
              <Input
                type="datetime-local"
                value={saleEnd}
                onInput={(event) => setSaleEnd(event.currentTarget.value)}
                className="w-full rounded-md border border-border bg-white text-slate-900"
              />
            </div>
          </div>

          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-3">
              <h3 className="text-lg font-bold">
                {t("organizer.create.ticketModal.ticketInfo", "Thông tin vé")}
              </h3>
              <OrganizerCountedTextarea
                value={description}
                maxLength={1000}
                placeholder={t("organizer.create.ticketModal.descriptionPlaceholder", "Description")}
                className="min-h-48"
                onChange={setDescription}
              />
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-bold">
                {t("organizer.create.ticketModal.ticketImage", "Hình ảnh vé")}
              </h3>
              <OrganizerUploadBox
                title={t("organizer.create.ticketModal.addImage", "Thêm")}
                size="1MB"
                className="aspect-[16/9] min-h-48"
              />
            </div>
          </div>

          <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleSave}>
            {t("organizer.create.ticketModal.save", "Lưu")}
          </Button>
        </div>
      </div>
    </div>
  );
}
