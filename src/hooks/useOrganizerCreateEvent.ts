import { useEffect, useMemo, useState, type Key } from "react";
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
import { useLocalImageUrl } from "../utils/useLocalImageUrl";

function toDateTimeLocalValue(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function buildInitialShowTimes(editingEvent?: StoredOrganizerEvent): ShowTime[] {
  if (editingEvent?.showTimes?.length) return editingEvent.showTimes;
  if (!editingEvent) return [];

  return [
    {
      id: editingEvent.sequenceId ?? Date.now(),
      name: "Suat dien 1",
      start: toDateTimeLocalValue(editingEvent.start),
      end: toDateTimeLocalValue(editingEvent.end ?? editingEvent.start),
      tickets: (editingEvent.ticketTiers ?? []).map((ticketTier, index) => ({
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

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Request failed";
}

export function useOrganizerCreateEvent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [editingEvent, setEditingEvent] = useState<StoredOrganizerEvent | undefined>(undefined);
  const [isLoadingEditingEvent, setIsLoadingEditingEvent] = useState(Boolean(eventId));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [eventName, setEventName] = useState("");
  const [eventCategory, setEventCategory] = useState<EventCategory | "">("");
  const [eventLocationMode, setEventLocationMode] = useState<EventLocationMode>("offline");
  const [provinceCode, setProvinceCode] = useState("");
  const [wardCode, setWardCode] = useState("");
  const [provinceSearch, setProvinceSearch] = useState("");
  const [wardSearch, setWardSearch] = useState("");
  const [venueName, setVenueName] = useState("");
  const [streetAddress, setStreetAddress] = useState("");

  const [currentStep, setCurrentStep] = useState(0);
  const [eventSequenceId, setEventSequenceId] = useState(() =>
    organizerEventsService.reserveNextSequenceId(),
  );

  const existingBannerImageUrl = useLocalImageUrl(editingEvent?.bannerImageKey);
  const [bannerImageUrl, setBannerImageUrl] = useState("");
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);

  const [showTimes, setShowTimes] = useState<ShowTime[]>([]);
  const [ticketModalState, setTicketModalState] = useState<{
    showTimeId: number | null;
    ticket: TicketTypeData | null;
  }>({ showTimeId: null, ticket: null });

  const [organizerName, setOrganizerName] = useState("");
  const [organizerDescription, setOrganizerDescription] = useState("");
  const existingOrganizerLogoUrl = useLocalImageUrl(editingEvent?.organizerLogoKey);
  const [organizerLogoUrl, setOrganizerLogoUrl] = useState("");
  const [organizerLogoFile, setOrganizerLogoFile] = useState<File | null>(null);

  const [eventDescription, setEventDescription] = useState("");

  function hydrateFormFromEvent(event: StoredOrganizerEvent) {
    setEventName(event.title ?? "");
    setEventLocationMode(event.locationMode ?? "offline");
    setProvinceCode(event.provinceCode ?? "");
    setWardCode(event.wardCode ?? "");
    setProvinceSearch("");
    setWardSearch("");
    setVenueName(event.venueName ?? "");
    setStreetAddress(event.streetAddress ?? "");
    setBannerImageUrl(event.bannerImageUrl ?? "");
    setBannerImageFile(null);
    setShowTimes(buildInitialShowTimes(event));
    setOrganizerName(event.organizerName ?? "");
    setOrganizerDescription(event.organizerDescription ?? "");
    setOrganizerLogoUrl(event.organizerLogoUrl ?? "");
    setOrganizerLogoFile(null);
    setEventDescription(event.eventDescription ?? "");
    setEventSequenceId(event.sequenceId ?? organizerEventsService.reserveNextSequenceId());
  }

  useEffect(() => {
    let cancelled = false;

    async function loadEvent() {
      if (!eventId) {
        setEditingEvent(undefined);
        setIsLoadingEditingEvent(false);
        setLoadError(null);
        return;
      }

      setIsLoadingEditingEvent(true);
      setLoadError(null);

      try {
        const event = await organizerEventsService.findById(eventId);
        if (!cancelled) {
          setEditingEvent(event);
          if (event) {
            if (event.status === "published") {
              setLoadError("Su kien da public nen khong the chinh sua.");
            } else {
              hydrateFormFromEvent(event);
            }
          } else {
            setLoadError("Khong tim thay su kien.");
          }
        }
      } catch (error) {
        if (!cancelled) setLoadError(getErrorMessage(error));
      } finally {
        if (!cancelled) setIsLoadingEditingEvent(false);
      }
    }

    loadEvent();

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const stepLabels = useMemo(
    () => organizerCreateSteps.map((step) => t(`organizer.create.steps.${step}`)),
    [t],
  );

  const eventCategoryOptions: EventCategoryOption[] = useMemo(
    () => [
      { value: "music", label: t("organizer.create.eventCategories.music", "Music") },
      { value: "conference", label: t("organizer.create.eventCategories.conference", "Conference") },
      { value: "workshop", label: t("organizer.create.eventCategories.workshop", "Workshop") },
      { value: "sports", label: t("organizer.create.eventCategories.sports", "Sports") },
      { value: "theater", label: t("organizer.create.eventCategories.theater", "Theater") },
      { value: "festival", label: t("organizer.create.eventCategories.festival", "Festival") },
      { value: "exhibition", label: t("organizer.create.eventCategories.exhibition", "Exhibition") },
      { value: "networking", label: t("organizer.create.eventCategories.networking", "Networking") },
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
    if (isSubmitting) return;

    setSubmitError(null);
    setIsSubmitting(true);

    const firstShowTime = showTimes[0];
    const ticketTiers = getStoredTicketTiers();
    const eventIdToStore = editingEvent?.id ?? String(eventSequenceId);

    const eventToStore: StoredOrganizerEvent = {
      id: eventIdToStore,
      sequenceId: eventSequenceId,
      bannerImageUrl: bannerImageFile ? undefined : editingEvent?.bannerImageUrl,
      showTimes,
      ticketTiers,
      title: eventName.trim() || t("organizer.create.untitledEvent", "Untitled event"),
      status: editingEvent?.status ?? "pending",
      start: firstShowTime?.start || editingEvent?.start || "",
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
      organizerLogoUrl: organizerLogoFile ? undefined : editingEvent?.organizerLogoUrl,
      eventDescription: eventDescription.trim(),
    };

    try {
      if (editingEvent) {
        await organizerEventsService.update(editingEvent.id, eventToStore, { bannerImageFile });
      } else {
        await organizerEventsService.create(eventToStore, { bannerImageFile });
      }
      navigate("/organizer/events");
    } catch (error) {
      const message = getErrorMessage(error);
      setSubmitError(message);
      window.alert(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function goToNextStep() {
    if (currentStep === organizerCreateSteps.length - 1) {
      void completeCreateEvent();
      return;
    }
    setCurrentStep((step) => Math.min(step + 1, organizerCreateSteps.length - 1));
  }

  function handleStepSelect(index: number) {
    setCurrentStep((step) => (index <= Math.max(step, organizerCreateSteps.length - 1) ? index : step));
  }

  function handleAddShowTime() {
    setShowTimes((current) => [
      ...current,
      {
        id: Date.now(),
        name: `Suat dien ${current.length + 1}`,
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
              tickets: source.tickets.map((ticket) => ({
                ...ticket,
                id: Date.now() + Math.random(),
              })),
            }
          : st,
      );
    });
  }

  return {
    currentStep,
    stepLabels,
    goToNextStep,
    handleStepSelect,
    eventName,
    eventCategory,
    eventCategoryOptions,
    selectedEventCategory,
    bannerImageUrl: bannerImageUrl || existingBannerImageUrl,
    eventLocationMode,
    venueName,
    streetAddress,
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
    organizerName,
    organizerDescription,
    organizerLogoUrl: organizerLogoUrl || existingOrganizerLogoUrl,
    onOrganizerNameChange: setOrganizerName,
    onOrganizerDescriptionChange: setOrganizerDescription,
    onOrganizerLogoChange: (url: string, file: File) => {
      setOrganizerLogoUrl(url);
      setOrganizerLogoFile(file);
    },
    eventDescription,
    onEventDescriptionChange: setEventDescription,
    showTimes,
    onAddShowTime: handleAddShowTime,
    onRemoveShowTime: handleRemoveShowTime,
    onChangeShowTime: handleChangeShowTime,
    onCreateTicketType: handleOpenCreateTicket,
    onEditTicketType: handleOpenEditTicket,
    onRemoveTicketType: handleRemoveTicket,
    onImportTicketsFromShowTime: handleImportTicketsFromShowTime,
    ticketModalState,
    onCloseTicketModal: handleCloseTicketModal,
    onSaveTicket: handleSaveTicket,
    eventSequenceId,
    isLoadingEditingEvent,
    loadError,
    submitError,
    isSubmitting,
  };
}
