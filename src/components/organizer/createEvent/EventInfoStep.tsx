import { Button, Card, Dropdown } from "@heroui/react";
import {
  Bold,
  ChevronDown,
  Eye,
  EyeOff,
  Heading1,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  List,
  ListOrdered,
  MapPin,
  PlaySquare,
  Quote,
  Underline,
  Wifi,
} from "lucide-react";
import { type Key, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import type { VietnamLocalityOption } from "../../../data/vietnamAdministrativeUnits";
import type {
  EventCategory,
  EventCategoryOption,
  EventLocationMode,
} from "../../../types/organizerCreate";
import {
  OrganizerCharacterInput,
  OrganizerCountedInput,
  OrganizerCountedTextarea,
  OrganizerFieldLabel,
  OrganizerFormPanel,
  OrganizerSearchableLocationDropdown,
  OrganizerUploadBox,
} from "../OrganizerFormControls";

type ToolbarAction = {
  icon: typeof Bold;
  label: string;
  prefix: string;
  suffix: string;
  placeholder: string;
};

const toolbarActions: ToolbarAction[] = [
  { icon: Bold, label: "Bold", prefix: "**", suffix: "**", placeholder: "văn bản đậm" },
  { icon: Italic, label: "Italic", prefix: "*", suffix: "*", placeholder: "văn bản nghiêng" },
  { icon: Underline, label: "Underline", prefix: "<u>", suffix: "</u>", placeholder: "văn bản gạch chân" },
  { icon: Heading1, label: "H1", prefix: "# ", suffix: "", placeholder: "Tiêu đề chính" },
  { icon: Heading2, label: "H2", prefix: "## ", suffix: "", placeholder: "Tiêu đề phụ" },
  { icon: Heading3, label: "H3", prefix: "### ", suffix: "", placeholder: "Tiêu đề nhỏ" },
  { icon: List, label: "List", prefix: "- ", suffix: "", placeholder: "mục danh sách" },
  { icon: ListOrdered, label: "Ordered", prefix: "1. ", suffix: "", placeholder: "mục danh sách" },
  { icon: Quote, label: "Quote", prefix: "> ", suffix: "", placeholder: "trích dẫn" },
  { icon: ImagePlus, label: "Image", prefix: "![", suffix: "](url)", placeholder: "mô tả ảnh" },
  { icon: PlaySquare, label: "Link", prefix: "[", suffix: "](url)", placeholder: "văn bản liên kết" },
];

function insertMarkdown(
  textareaRef: React.RefObject<HTMLTextAreaElement | null>,
  value: string,
  onChange: (value: string) => void,
  action: ToolbarAction,
) {
  const textarea = textareaRef.current;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = value.substring(start, end) || action.placeholder;
  const newText =
    value.substring(0, start) +
    action.prefix +
    selectedText +
    action.suffix +
    value.substring(end);

  onChange(newText);

  // Restore cursor position after state update
  requestAnimationFrame(() => {
    textarea.focus();
    const newCursorPos = start + action.prefix.length + selectedText.length;
    textarea.setSelectionRange(
      start + action.prefix.length,
      newCursorPos,
    );
  });
}

function EventInfoEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showPreview, setShowPreview] = useState(false);

  return (
    <OrganizerFormPanel>
      <div className="flex items-center justify-between">
        <OrganizerFieldLabel>{t("organizer.create.eventInfo", "Thông tin sự kiện")}</OrganizerFieldLabel>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-surface-secondary hover:text-foreground"
        >
          {showPreview ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
          {showPreview
            ? t("organizer.create.hidePreview", "Ẩn xem trước")
            : t("organizer.create.showPreview", "Xem trước")}
        </button>
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-surface-secondary">
        <div className="flex flex-wrap items-center gap-1 border-b border-border bg-surface-tertiary px-2 py-1.5">
          {toolbarActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                type="button"
                title={action.label}
                onClick={() => insertMarkdown(textareaRef, value, onChange, action)}
                className="flex size-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-secondary hover:text-foreground"
              >
                <Icon className="size-4" />
              </button>
            );
          })}
        </div>

        {showPreview ? (
          <div className="min-h-56 w-full bg-surface-secondary p-4 text-sm leading-6">
            {value.trim() ? (
              <div className="prose prose-sm max-w-none prose-headings:font-bold prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5">
                <ReactMarkdown>{value}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-muted">
                {t("organizer.create.previewEmpty", "Chưa có nội dung. Nhập nội dung ở tab soạn thảo.")}
              </p>
            )}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            className="min-h-56 w-full resize-y bg-surface-secondary p-4 font-mono text-sm leading-6 text-foreground outline-none placeholder:text-muted"
            value={value}
            placeholder={t(
              "organizer.create.eventInfoPlaceholder",
              "Nhập thông tin chi tiết về sự kiện...\n\nSử dụng thanh công cụ phía trên để định dạng văn bản (in đậm, in nghiêng, tiêu đề, danh sách...)",
            )}
            onInput={(event) => onChange(event.currentTarget.value)}
          />
        )}
      </div>
    </OrganizerFormPanel>
  );
}

function OrganizerInfoPanel({
  organizerName,
  organizerDescription,
  organizerLogoUrl,
  onOrganizerNameChange,
  onOrganizerDescriptionChange,
  onOrganizerLogoChange,
}: {
  organizerName: string;
  organizerDescription: string;
  organizerLogoUrl: string;
  onOrganizerNameChange: (value: string) => void;
  onOrganizerDescriptionChange: (value: string) => void;
  onOrganizerLogoChange: (url: string, file: File) => void;
}) {
  const { t } = useTranslation();

  return (
    <OrganizerFormPanel>
      <div className="grid gap-5 lg:grid-cols-[auto_minmax(0,1fr)]">
        <OrganizerUploadBox
          title={t("organizer.create.logoUpload", "Thêm logo ban tổ chức")}
          size="275x275"
          className="aspect-square w-full max-w-[275px] !min-h-0"
          imageUrl={organizerLogoUrl}
          onImageAccepted={(image) => onOrganizerLogoChange(image.url, image.file)}
        />
        <div className="space-y-5">
          <div className="space-y-2">
            <OrganizerFieldLabel>{t("organizer.create.organizerName", "Tên ban tổ chức")}</OrganizerFieldLabel>
            <OrganizerCharacterInput
              placeholder={t("organizer.create.organizerNamePlaceholder", "Tên ban tổ chức")}
              maxLength={80}
              value={organizerName}
              onChange={onOrganizerNameChange}
            />
          </div>
          <div className="space-y-2">
            <OrganizerFieldLabel>
              {t("organizer.create.organizerDescription", "Thông tin ban tổ chức")}
            </OrganizerFieldLabel>
            <OrganizerCountedTextarea
              value={organizerDescription}
              maxLength={500}
              placeholder={t("organizer.create.organizerDescriptionPlaceholder", "Thông tin ban tổ chức")}
              onChange={onOrganizerDescriptionChange}
            />
          </div>
        </div>
      </div>
    </OrganizerFormPanel>
  );
}

export default function EventInfoStep({
  eventName,
  eventCategory,
  eventCategoryOptions,
  bannerImageUrl,
  eventLocationMode,
  filteredProvinceOptions,
  filteredWardOptions,
  provinceCode,
  provinceSearch,
  selectedEventCategory,
  selectedProvince,
  selectedWard,
  wardCode,
  wardSearch,
  venueName,
  streetAddress,
  onEventCategoryChange,
  onEventNameChange,
  onBannerImageChange,
  onLocationModeChange,
  onProvinceSearchChange,
  onProvinceSelect,
  onWardSearchChange,
  onWardSelect,
  onVenueNameChange,
  onStreetAddressChange,
  organizerName,
  organizerDescription,
  organizerLogoUrl,
  onOrganizerNameChange,
  onOrganizerDescriptionChange,
  onOrganizerLogoChange,
  eventDescription,
  onEventDescriptionChange,
}: {
  eventName: string;
  eventCategory: EventCategory | "";
  eventCategoryOptions: EventCategoryOption[];
  bannerImageUrl: string;
  eventLocationMode: EventLocationMode;
  filteredProvinceOptions: VietnamLocalityOption[];
  filteredWardOptions: VietnamLocalityOption[];
  provinceCode: string;
  provinceSearch: string;
  selectedEventCategory?: EventCategoryOption;
  selectedProvince?: VietnamLocalityOption;
  selectedWard?: VietnamLocalityOption;
  wardCode: string;
  wardSearch: string;
  venueName: string;
  streetAddress: string;
  onEventCategoryChange: (key: Key) => void;
  onEventNameChange: (value: string) => void;
  onBannerImageChange: (url: string, file: File) => void;
  onLocationModeChange: (mode: EventLocationMode) => void;
  onProvinceSearchChange: (value: string) => void;
  onProvinceSelect: (key: Key) => void;
  onWardSearchChange: (value: string) => void;
  onWardSelect: (key: Key) => void;
  onVenueNameChange: (value: string) => void;
  onStreetAddressChange: (value: string) => void;
  organizerName: string;
  organizerDescription: string;
  organizerLogoUrl: string;
  onOrganizerNameChange: (value: string) => void;
  onOrganizerDescriptionChange: (value: string) => void;
  onOrganizerLogoChange: (url: string, file: File) => void;
  eventDescription: string;
  onEventDescriptionChange: (value: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <Card className="mx-auto max-w-[1434px] border border-border bg-surface text-foreground">
      <Card.Content className="gap-10 p-5 md:p-6 lg:p-8">
        <section className="space-y-5">
          <div className="flex flex-wrap items-center gap-5">
            <h1 className="text-base font-bold">
              <span className="text-danger">*</span>{" "}
              {t("organizer.create.uploadImages", "Upload hình ảnh")}
            </h1>
            <button type="button" className="text-sm font-medium text-accent hover:underline">
              {t("organizer.create.viewImagePositions", "Xem vị trí hiển thị các ảnh")}
            </button>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(260px,360px)_minmax(0,852px)] xl:items-stretch xl:justify-center">
            <OrganizerUploadBox
              title={t(
                "organizer.create.posterUpload",
                "Thêm ảnh sự kiện để hiển thị ở các vị trí khác",
              )}
              size="720x958"
              className="mx-auto h-[320px] min-h-0 w-full max-w-[360px] md:h-[420px] xl:mx-0"
            />
            <OrganizerUploadBox
              title={t("organizer.create.bannerUpload", "Thêm ảnh nền sự kiện")}
              size="1280x720"
              className="mx-auto h-[320px] min-h-0 w-full max-w-[852px] md:h-[420px] xl:mx-0"
              imageUrl={bannerImageUrl}
              onImageAccepted={(image) => onBannerImageChange(image.url, image.file)}
            />
          </div>
        </section>

        <OrganizerFormPanel>
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="space-y-3">
              <OrganizerFieldLabel htmlFor="organizer-event-name">
                {t("organizer.create.eventName", "Tên sự kiện")}
              </OrganizerFieldLabel>
              <OrganizerCountedInput
                id="organizer-event-name"
                value={eventName}
                maxLength={100}
                placeholder={t("organizer.create.eventNamePlaceholder", "Tên sự kiện")}
                onChange={onEventNameChange}
              />
            </section>

            <section className="space-y-3">
              <OrganizerFieldLabel>{t("organizer.create.eventType", "Thể loại sự kiện")}</OrganizerFieldLabel>
              <Dropdown>
                <Dropdown.Trigger>
                  <Button
                    id="organizer-event-category"
                    variant="tertiary"
                    className={`h-10 w-full justify-between rounded-md border border-border bg-white px-3 text-left text-sm font-normal hover:bg-white/90 ${
                      selectedEventCategory ? "text-slate-900" : "text-slate-400"
                    }`}
                  >
                    {selectedEventCategory?.label ?? t("organizer.create.eventTypePlaceholder", "Vui lòng chọn")}
                    <ChevronDown className="size-4 text-slate-500" />
                  </Button>
                </Dropdown.Trigger>
                <Dropdown.Popover>
                  <Dropdown.Menu
                    onAction={onEventCategoryChange}
                    selectionMode="single"
                    selectedKeys={eventCategory ? new Set([eventCategory]) : new Set()}
                  >
                    {eventCategoryOptions.map((option) => (
                      <Dropdown.Item id={option.value} key={option.value} textValue={option.label}>
                        <Dropdown.ItemIndicator />
                        <span>{option.label}</span>
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown>
            </section>
          </div>
        </OrganizerFormPanel>

        <OrganizerFormPanel>
          <div className="space-y-3">
            <OrganizerFieldLabel>{t("organizer.create.eventAddress", "Địa chỉ sự kiện")}</OrganizerFieldLabel>
            <div className="inline-flex rounded-md bg-surface-secondary p-1">
              <Button
                type="button"
                size="sm"
                variant={eventLocationMode === "offline" ? undefined : "tertiary"}
                className={
                  eventLocationMode === "offline"
                    ? "bg-accent text-accent-foreground hover:bg-accent/90"
                    : "text-foreground"
                }
                onClick={() => onLocationModeChange("offline")}
              >
                <MapPin className="size-4" />
                {t("organizer.create.offline", "Offline")}
              </Button>
              <Button
                type="button"
                size="sm"
                variant={eventLocationMode === "online" ? undefined : "tertiary"}
                className={
                  eventLocationMode === "online"
                    ? "bg-accent text-accent-foreground hover:bg-accent/90"
                    : "text-foreground"
                }
                onClick={() => onLocationModeChange("online")}
              >
                <Wifi className="size-4" />
                {t("organizer.create.online", "Online")}
              </Button>
            </div>
          </div>

          {eventLocationMode === "offline" && (
            <>
              <div className="space-y-2">
                <OrganizerFieldLabel>{t("organizer.create.venueName", "Tên địa điểm")}</OrganizerFieldLabel>
                <OrganizerCharacterInput
                  placeholder={t("organizer.create.venueNamePlaceholder", "Tên địa điểm")}
                  maxLength={80}
                  value={venueName}
                  onChange={onVenueNameChange}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <OrganizerFieldLabel>{t("organizer.create.city", "Tỉnh/Thành")}</OrganizerFieldLabel>
                  <OrganizerSearchableLocationDropdown
                    id="organizer-province"
                    selectedCode={provinceCode}
                    selectedOption={selectedProvince}
                    options={filteredProvinceOptions}
                    placeholder={t("organizer.create.cityPlaceholder", "Tỉnh/Thành")}
                    searchPlaceholder={t("organizer.create.locationSearchPlaceholder", "Tìm theo tên hoặc mã")}
                    searchValue={provinceSearch}
                    emptyMessage={t("organizer.create.locationEmpty", "Không tìm thấy địa phương phù hợp")}
                    onSearchChange={onProvinceSearchChange}
                    onSelect={onProvinceSelect}
                  />
                </div>
                <div className="space-y-2">
                  <OrganizerFieldLabel>{t("organizer.create.ward", "Phường/Xã")}</OrganizerFieldLabel>
                  <OrganizerSearchableLocationDropdown
                    id="organizer-ward"
                    selectedCode={wardCode}
                    selectedOption={selectedWard}
                    options={filteredWardOptions}
                    placeholder={
                      provinceCode
                        ? t("organizer.create.wardPlaceholder", "Phường/Xã")
                        : t("organizer.create.wardSelectProvinceFirst", "Chọn Tỉnh/Thành trước")
                    }
                    searchPlaceholder={t("organizer.create.locationSearchPlaceholder", "Tìm theo tên hoặc mã")}
                    searchValue={wardSearch}
                    emptyMessage={t("organizer.create.locationEmpty", "Không tìm thấy địa phương phù hợp")}
                    isDisabled={!provinceCode}
                    onSearchChange={onWardSearchChange}
                    onSelect={onWardSelect}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <OrganizerFieldLabel>{t("organizer.create.street", "Số nhà, đường")}</OrganizerFieldLabel>
                <OrganizerCharacterInput
                  placeholder={t("organizer.create.streetPlaceholder", "Số nhà, đường")}
                  maxLength={80}
                  value={streetAddress}
                  onChange={onStreetAddressChange}
                />
              </div>
            </>
          )}
        </OrganizerFormPanel>

        <EventInfoEditor value={eventDescription} onChange={onEventDescriptionChange} />
        <OrganizerInfoPanel
          organizerName={organizerName}
          organizerDescription={organizerDescription}
          organizerLogoUrl={organizerLogoUrl}
          onOrganizerNameChange={onOrganizerNameChange}
          onOrganizerDescriptionChange={onOrganizerDescriptionChange}
          onOrganizerLogoChange={onOrganizerLogoChange}
        />
      </Card.Content>
    </Card>
  );
}
