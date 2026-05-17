import { useMemo, useState, type Key } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import {
  getVietnamWardsByProvinceCode,
  vietnamProvinces,
} from "../data/vietnamAdministrativeUnits";
import {
  organizerCreateSteps,
  type EventCategory,
  type EventCategoryOption,
  type EventLocationMode,
  type ShowTime,
  type TicketTypeData,
} from "../types/organizerCreate";
import {
  organizerEventsService,
  type StoredOrganizerEvent,
  type StoredOrganizerTicketTier,
} from "../api/organizerEventsService";
import { filterLocationOptions } from "../utils/organizer/organizerLocationSearch";
import { saveLocalImage } from "../utils/localImageStorage";
import { useLocalImageUrl } from "../utils/useLocalImageUrl";

function buildInitialShowTimes(editingEvent?: StoredOrganizerEvent): ShowTime[] {
  if (editingEvent?.showTimes?.length) return editingEvent.showTimes;
  if (!editingEvent?.ticketTiers?.length) return [];

  return [
    {
      id: 1,
      name: "Suất diễn 1",
      start: editingEvent.start,
      end: editingEvent.end ?? editingEvent.start,
      tickets: editingEvent.ticketTiers.map((ticketTier, index) => ({
        id: index + 1,
        name: ticketTier.name,
        price: String(ticketTier.price),
        isFree: ticketTier.price === 0,
        totalQuantity: "10",
        minPerOrder: "1",
        maxPerOrder: "10",
        saleStart: "",
        saleEnd: "",
        description: "",
      })),
    },
  ];
}

export function useOrganizerCreateEvent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { eventId } = useParams();
  const editingEvent = useMemo(
    () => (eventId ? organizerEventsService.findById(eventId) : undefined),
    [eventId],
  );

  // ── Event basic info ──
  const [eventName, setEventName] = useState(editingEvent?.title ?? "");
  const [eventCategory, setEventCategory] = useState<EventCategory | "">("");
  const [eventLocationMode, setEventLocationMode] = useState<EventLocationMode>(
    editingEvent?.locationMode ?? "offline",
  );
  const [provinceCode, setProvinceCode] = useState(editingEvent?.provinceCode ?? "");
  const [wardCode, setWardCode] = useState(editingEvent?.wardCode ?? "");
  const [provinceSearch, setProvinceSearch] = useState("");
  const [wardSearch, setWardSearch] = useState("");
  const [venueName, setVenueName] = useState(editingEvent?.venueName ?? "");
  const [streetAddress, setStreetAddress] = useState(editingEvent?.streetAddress ?? "");

  // ── Wizard step ──
  const [currentStep, setCurrentStep] = useState(0);
  const [eventSequenceId] = useState(
    () => editingEvent?.sequenceId ?? organizerEventsService.reserveNextSequenceId(),
  );

  // ── Banner image ──
  const existingBannerImageUrl = useLocalImageUrl(editingEvent?.bannerImageKey);
  const [bannerImageUrl, setBannerImageUrl] = useState(editingEvent?.bannerImageUrl ?? "");
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);

  // ── Show times & tickets ──
  const [showTimes, setShowTimes] = useState<ShowTime[]>(() =>
    buildInitialShowTimes(editingEvent),
  );
  const [ticketModalState, setTicketModalState] = useState<{
    showTimeId: number | null;
    ticket: TicketTypeData | null;
  }>({ showTimeId: null, ticket: null });

  // ── Organizer info ──
  const [organizerName, setOrganizerName] = useState(editingEvent?.organizerName ?? "");
  const [organizerDescription, setOrganizerDescription] = useState(
    editingEvent?.organizerDescription ?? "",
  );
  const existingOrganizerLogoUrl = useLocalImageUrl(editingEvent?.organizerLogoKey);
  const [organizerLogoUrl, setOrganizerLogoUrl] = useState(editingEvent?.organizerLogoUrl ?? "");
  const [organizerLogoFile, setOrganizerLogoFile] = useState<File | null>(null);

  // ── Event description ──
  const [eventDescription, setEventDescription] = useState(editingEvent?.eventDescription ?? "");

  // ── Derived values ──
  const stepLabels = useMemo(
    () => organizerCreateSteps.map((step) => t(`organizer.create.steps.${step}`)),
    [t],
  );

  const eventCategoryOptions: EventCategoryOption[] = useMemo(
    () => [
      { value: "music", label: t("organizer.create.eventCategories.music", "Âm nhạc") },
      { value: "conference", label: t("organizer.create.eventCategories.conference", "Hội thảo") },
      { value: "workshop", label: t("organizer.create.eventCategories.workshop", "Workshop / Lớp học") },
      { value: "sports", label: t("organizer.create.eventCategories.sports", "Thể thao") },
      { value: "theater", label: t("organizer.create.eventCategories.theater", "Sân khấu / Biểu diễn") },
      { value: "festival", label: t("organizer.create.eventCategories.festival", "Lễ hội") },
      { value: "exhibition", label: t("organizer.create.eventCategories.exhibition", "Triển lãm") },
      { value: "networking", label: t("organizer.create.eventCategories.networking", "Gặp gỡ / Networking") },
    ],
    [t],
  );

  const selectedEventCategory = eventCategoryOptions.find((option) => option.value === eventCategory);
  const selectedProvince = vietnamProvinces.find((province) => province.code === provinceCode);
  const wardOptions = useMemo(
    () => (provinceCode ? getVietnamWardsByProvinceCode(provinceCode) : []),
    [provinceCode],
  );
  const selectedWard = wardOptions.find((ward) => ward.code === wardCode);
  const filteredProvinceOptions = useMemo(
    () => filterLocationOptions(vietnamProvinces, provinceSearch),
    [provinceSearch],
  );
  const filteredWardOptions = useMemo(
    () => filterLocationOptions(wardOptions, wardSearch),
    [wardOptions, wardSearch],
  );

  // ── Handlers ──
  function handleEventCategoryChange(key: Key) {
    setEventCategory(key.toString() as EventCategory);
  }

  function handleProvinceChange(key: Key) {
    const code = key.toString();
    setProvinceCode(code);
    setWardCode("");
    setProvinceSearch("");
    setWardSearch("");
  }

  function handleWardChange(key: Key) {
    setWardCode(key.toString());
    setWardSearch("");
  }

  function handleLocationModeChange(mode: EventLocationMode) {
    setEventLocationMode(mode);
    if (mode === "online") {
      setProvinceCode("");
      setWardCode("");
      setProvinceSearch("");
      setWardSearch("");
    }
  }

  function handleBannerImageChange(url: string, file: File) {
    setBannerImageUrl(url);
    setBannerImageFile(file);
  }

  function parseTicketPrice(ticket: TicketTypeData) {
    if (ticket.isFree) return 0;
    const normalizedPrice = ticket.price.replace(/[^\d]/g, "");
    const price = Number(normalizedPrice);
    return Number.isFinite(price) ? price : 0;
  }

  function getStoredTicketTiers(): StoredOrganizerTicketTier[] {
    const ticketTiers = showTimes.flatMap((showTime) =>
      showTime.tickets.map((ticket) => ({
        id: `${showTime.id}-${ticket.id}`,
        name: ticket.name,
        price: parseTicketPrice(ticket),
      })),
    );
    return ticketTiers.length > 0 ? ticketTiers : editingEvent?.ticketTiers ?? [];
  }

  async function completeCreateEvent() {
    const firstShowTime = showTimes[0];
    const ticketTiers = getStoredTicketTiers();
    const eventIdToStore = editingEvent?.id ?? `organizer-event-${eventSequenceId}`;
    let bannerImageKey = editingEvent?.bannerImageKey;

    if (bannerImageFile) {
      bannerImageKey = `${eventIdToStore}-banner`;
      try {
        await saveLocalImage(bannerImageKey, bannerImageFile);
      } catch {
        window.alert("Không lưu được ảnh sự kiện trên trình duyệt này. Vui lòng chọn ảnh khác hoặc thử lại.");
        return;
      }
    }

    let organizerLogoKey = editingEvent?.organizerLogoKey;
    if (organizerLogoFile) {
      organizerLogoKey = `${eventIdToStore}-organizer-logo`;
      try {
        await saveLocalImage(organizerLogoKey, organizerLogoFile);
      } catch {
        window.alert("Không lưu được logo ban tổ chức trên trình duyệt này. Vui lòng chọn ảnh khác hoặc thử lại.");
        return;
      }
    }

    const eventToStore = {
      id: eventIdToStore,
      sequenceId: eventSequenceId,
      bannerImageKey,
      bannerImageUrl: bannerImageFile ? undefined : editingEvent?.bannerImageUrl,
      showTimes,
      ticketTiers,
      title: eventName.trim() || t("organizer.create.untitledEvent", "Sự kiện chưa đặt tên"),
      status: t("organizer.events.tabs.pending", "Chờ duyệt"),
      start: firstShowTime?.start || editingEvent?.start || new Date().toISOString(),
      end: firstShowTime?.end ?? editingEvent?.end,
      showtimeCount: showTimes.length || editingEvent?.showtimeCount || 0,
      ticketTypeCount: ticketTiers.length || editingEvent?.ticketTypeCount || 0,
      createdAt: editingEvent?.createdAt ?? new Date().toISOString(),
      locationMode: eventLocationMode,
      venueName: venueName.trim(),
      provinceCode,
      provinceName: selectedProvince?.name ?? "",
      wardCode,
      wardName: selectedWard?.name ?? "",
      streetAddress: streetAddress.trim(),
      organizerName: organizerName.trim(),
      organizerDescription: organizerDescription.trim(),
      organizerLogoKey,
      organizerLogoUrl: organizerLogoFile ? undefined : editingEvent?.organizerLogoUrl,
      eventDescription: eventDescription.trim(),
    };

    if (editingEvent) {
      organizerEventsService.update(editingEvent.id, eventToStore);
    } else {
      organizerEventsService.create(eventToStore);
    }
    navigate("/organizer/events");
  }

  function goToNextStep() {
    if (currentStep === organizerCreateSteps.length - 1) {
      completeCreateEvent();
      return;
    }
    setCurrentStep((step) => Math.min(step + 1, organizerCreateSteps.length - 1));
  }

  function handleStepSelect(index: number) {
    setCurrentStep((step) => (index <= Math.max(step, organizerCreateSteps.length - 1) ? index : step));
  }

  // ── Show time handlers ──
  function handleAddShowTime() {
    setShowTimes((current) => [
      ...current,
      {
        id: current.length + 1,
        name: `Suất diễn ${current.length + 1}`,
        start: "",
        end: "",
        tickets: [],
      },
    ]);
  }

  function handleRemoveShowTime(id: number) {
    setShowTimes((current) => current.filter((showTime) => showTime.id !== id));
  }

  function handleChangeShowTime(id: number, field: "start" | "end" | "name", value: string) {
    setShowTimes((current) =>
      current.map((showTime) =>
        showTime.id === id ? { ...showTime, [field]: value } : showTime,
      ),
    );
  }

  // ── Ticket modal handlers ──
  function handleOpenCreateTicket(showTimeId: number) {
    setTicketModalState({ showTimeId, ticket: null });
  }

  function handleOpenEditTicket(showTimeId: number, ticket: TicketTypeData) {
    setTicketModalState({ showTimeId, ticket });
  }

  function handleCloseTicketModal() {
    setTicketModalState({ showTimeId: null, ticket: null });
  }

  function handleSaveTicket(ticket: TicketTypeData) {
    if (!ticketModalState.showTimeId) return;
    setShowTimes((current) =>
      current.map((showTime) => {
        if (showTime.id !== ticketModalState.showTimeId) return showTime;
        const editing = showTime.tickets.some((item) => item.id === ticket.id);
        return {
          ...showTime,
          tickets: editing
            ? showTime.tickets.map((item) => (item.id === ticket.id ? ticket : item))
            : [...showTime.tickets, ticket],
        };
      }),
    );
    handleCloseTicketModal();
  }

  function handleRemoveTicket(showTimeId: number, ticketId: number) {
    setShowTimes((current) =>
      current.map((showTime) =>
        showTime.id === showTimeId
          ? { ...showTime, tickets: showTime.tickets.filter((ticket) => ticket.id !== ticketId) }
          : showTime,
      ),
    );
  }

  function handleImportTicketsFromShowTime(targetShowTimeId: number, sourceShowTimeId: number) {
    setShowTimes((current) => {
      const source = current.find((st) => st.id === sourceShowTimeId);
      if (!source || source.tickets.length === 0) return current;
      return current.map((st) =>
        st.id === targetShowTimeId
          ? {
              ...st,
              tickets: source.tickets.map((ticket, idx) => ({
                ...ticket,
                id: Date.now() + idx,
              })),
            }
          : st,
      );
    });
  }

  return {
    // Wizard
    currentStep,
    stepLabels,
    goToNextStep,
    handleStepSelect,
    // Event info
    eventName,
    eventCategory,
    eventCategoryOptions,
    selectedEventCategory,
    bannerImageUrl: bannerImageUrl || existingBannerImageUrl,
    eventLocationMode,
    venueName,
    streetAddress,
    // Location
    provinceCode,
    provinceSearch,
    selectedProvince,
    wardCode,
    wardSearch,
    selectedWard,
    filteredProvinceOptions,
    filteredWardOptions,
    onEventCategoryChange: handleEventCategoryChange,
    onEventNameChange: setEventName,
    onBannerImageChange: handleBannerImageChange,
    onLocationModeChange: handleLocationModeChange,
    onProvinceSearchChange: setProvinceSearch,
    onProvinceSelect: handleProvinceChange,
    onWardSearchChange: setWardSearch,
    onWardSelect: handleWardChange,
    onVenueNameChange: setVenueName,
    onStreetAddressChange: setStreetAddress,
    // Organizer info
    organizerName,
    organizerDescription,
    organizerLogoUrl: organizerLogoUrl || existingOrganizerLogoUrl,
    onOrganizerNameChange: setOrganizerName,
    onOrganizerDescriptionChange: setOrganizerDescription,
    onOrganizerLogoChange: (url: string, file: File) => {
      setOrganizerLogoUrl(url);
      setOrganizerLogoFile(file);
    },
    // Event description
    eventDescription,
    onEventDescriptionChange: setEventDescription,
    // Show times
    showTimes,
    onAddShowTime: handleAddShowTime,
    onRemoveShowTime: handleRemoveShowTime,
    onChangeShowTime: handleChangeShowTime,
    // Tickets
    onCreateTicketType: handleOpenCreateTicket,
    onEditTicketType: handleOpenEditTicket,
    onRemoveTicketType: handleRemoveTicket,
    onImportTicketsFromShowTime: handleImportTicketsFromShowTime,
    // Ticket modal
    ticketModalState,
    onCloseTicketModal: handleCloseTicketModal,
    onSaveTicket: handleSaveTicket,
    // Misc
    eventSequenceId,
  };
}
