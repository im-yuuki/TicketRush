import { Button, Card, Dropdown } from "@heroui/react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  ImagePlus,
  Italic,
  List,
  ListOrdered,
  MapPin,
  PlaySquare,
  Underline,
  Wifi,
} from "lucide-react";
import { useState, type Key } from "react";
import { useTranslation } from "react-i18next";
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

function EventInfoEditor() {
  const { t } = useTranslation();
  const toolbarIcons = [
    Bold,
    Italic,
    Underline,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    List,
    ListOrdered,
    ImagePlus,
    PlaySquare,
  ];

  return (
    <OrganizerFormPanel>
      <OrganizerFieldLabel>{t("organizer.create.eventInfo", "Thông tin sự kiện")}</OrganizerFieldLabel>
      <div className="overflow-hidden rounded-md border border-border bg-surface-secondary">
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-surface-tertiary px-3 py-2">
          <button
            type="button"
            className="inline-flex h-8 items-center gap-2 rounded-md px-3 text-xs font-semibold hover:bg-surface-secondary"
          >
            Paragraph
            <ChevronDown className="size-3.5" />
          </button>
          <span className="size-4 rounded-sm bg-white" />
          <span className="size-4 rounded-sm bg-success" />
          <span className="size-4 rounded-sm bg-danger" />
          <span className="size-4 rounded-sm bg-warning" />
          {toolbarIcons.map((Icon, index) => (
            <button
              key={index}
              type="button"
              className="flex size-8 items-center justify-center rounded-md hover:bg-surface-secondary"
            >
              <Icon className="size-4" />
            </button>
          ))}
        </div>
        <textarea
          className="min-h-56 w-full resize-y bg-surface-secondary p-4 text-sm leading-6 text-foreground outline-none placeholder:text-muted"
          defaultValue={t("organizer.create.eventInfoTemplate")}
        />
      </div>
    </OrganizerFormPanel>
  );
}

function OrganizerInfoPanel() {
  const { t } = useTranslation();
  const [description, setDescription] = useState("");

  return (
    <OrganizerFormPanel>
      <div className="grid gap-5 lg:grid-cols-[136px_minmax(0,1fr)]">
        <OrganizerUploadBox
          title={t("organizer.create.logoUpload", "Thêm logo ban tổ chức")}
          size="275x275"
          className="aspect-square min-h-0"
        />
        <div className="space-y-5">
          <div className="space-y-2">
            <OrganizerFieldLabel>{t("organizer.create.organizerName", "Tên ban tổ chức")}</OrganizerFieldLabel>
            <OrganizerCharacterInput
              placeholder={t("organizer.create.organizerNamePlaceholder", "Tên ban tổ chức")}
              maxLength={80}
            />
          </div>
          <div className="space-y-2">
            <OrganizerFieldLabel>
              {t("organizer.create.organizerDescription", "Thông tin ban tổ chức")}
            </OrganizerFieldLabel>
            <OrganizerCountedTextarea
              value={description}
              maxLength={500}
              placeholder={t("organizer.create.organizerDescriptionPlaceholder", "Thông tin ban tổ chức")}
              onChange={setDescription}
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
  onEventCategoryChange,
  onEventNameChange,
  onLocationModeChange,
  onProvinceSearchChange,
  onProvinceSelect,
  onWardSearchChange,
  onWardSelect,
}: {
  eventName: string;
  eventCategory: EventCategory | "";
  eventCategoryOptions: EventCategoryOption[];
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
  onEventCategoryChange: (key: Key) => void;
  onEventNameChange: (value: string) => void;
  onLocationModeChange: (mode: EventLocationMode) => void;
  onProvinceSearchChange: (value: string) => void;
  onProvinceSelect: (key: Key) => void;
  onWardSearchChange: (value: string) => void;
  onWardSelect: (key: Key) => void;
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

          <div className="grid gap-5 xl:grid-cols-[minmax(260px,344px)_minmax(0,1fr)]">
            <OrganizerUploadBox
              title={t(
                "organizer.create.posterUpload",
                "Thêm ảnh sự kiện để hiển thị ở các vị trí khác",
              )}
              size="720x958"
              className="aspect-[720/958] min-h-[420px]"
            />
            <OrganizerUploadBox
              title={t("organizer.create.bannerUpload", "Thêm ảnh nền sự kiện")}
              size="1280x720"
              className="aspect-video min-h-[300px] xl:min-h-[420px]"
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
                />
              </div>
            </>
          )}
        </OrganizerFormPanel>

        <EventInfoEditor />
        <OrganizerInfoPanel />
      </Card.Content>
    </Card>
  );
}
