import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState, type Key } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import EventInfoStep from "../components/organizer/createEvent/EventInfoStep";
import OrganizerWizardHeader from "../components/organizer/createEvent/OrganizerWizardHeader";
import PaymentInfoStep from "../components/organizer/createEvent/PaymentInfoStep";
import SettingsStep from "../components/organizer/createEvent/SettingsStep";
import TicketTypeModal from "../components/organizer/createEvent/TicketTypeModal";
import TimeAndTicketsStep from "../components/organizer/createEvent/TimeAndTicketsStep";
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
  appendStoredOrganizerEvent,
  findStoredOrganizerEvent,
  reserveNextOrganizerEventSequenceId,
  type StoredOrganizerEvent,
  type StoredOrganizerTicketTier,
  updateStoredOrganizerEvent,
} from "../utils/organizerEventsStorage";
import { filterLocationOptions } from "../utils/organizerLocationSearch";
import { saveLocalImage } from "../utils/localImageStorage";
import { useLocalImageUrl } from "../utils/useLocalImageUrl";

function buildInitialShowTimes(editingEvent?: StoredOrganizerEvent): ShowTime[] {
  if (editingEvent?.showTimes?.length) return editingEvent.showTimes;
  if (!editingEvent?.ticketTiers?.length) return [];

  return [
    {
      id: Date.now(),
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

export default function OrganizerCreateEvent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { eventId } = useParams();
  const editingEvent = useMemo(
    () => (eventId ? findStoredOrganizerEvent(eventId) : undefined),
    [eventId],
  );
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
  const [currentStep, setCurrentStep] = useState(0);
  const [eventSequenceId] = useState(
    () => editingEvent?.sequenceId ?? reserveNextOrganizerEventSequenceId(),
  );
  const existingBannerImageUrl = useLocalImageUrl(editingEvent?.bannerImageKey);
  const [bannerImageUrl, setBannerImageUrl] = useState(editingEvent?.bannerImageUrl ?? "");
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [showTimes, setShowTimes] = useState<ShowTime[]>(() =>
    buildInitialShowTimes(editingEvent),
  );
  const [ticketModalState, setTicketModalState] = useState<{
    showTimeId: number | null;
    ticket: TicketTypeData | null;
  }>({ showTimeId: null, ticket: null });
  // Organizer info
  const [organizerName, setOrganizerName] = useState(editingEvent?.organizerName ?? "");
  const [organizerDescription, setOrganizerDescription] = useState(
    editingEvent?.organizerDescription ?? "",
  );
  const existingOrganizerLogoUrl = useLocalImageUrl(editingEvent?.organizerLogoKey);
  const [organizerLogoUrl, setOrganizerLogoUrl] = useState(editingEvent?.organizerLogoUrl ?? "");
  const [organizerLogoFile, setOrganizerLogoFile] = useState<File | null>(null);
  // Event description
  const [eventDescription, setEventDescription] = useState(editingEvent?.eventDescription ?? "");

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
      // Event info fields
      locationMode: eventLocationMode,
      venueName: venueName.trim(),
      provinceCode,
      provinceName: selectedProvince?.name ?? "",
      wardCode,
      wardName: selectedWard?.name ?? "",
      streetAddress: streetAddress.trim(),
      // Organizer info fields
      organizerName: organizerName.trim(),
      organizerDescription: organizerDescription.trim(),
      organizerLogoKey,
      organizerLogoUrl: organizerLogoFile ? undefined : editingEvent?.organizerLogoUrl,
      // Event description
      eventDescription: eventDescription.trim(),
    };

    if (editingEvent) {
      updateStoredOrganizerEvent(editingEvent.id, eventToStore);
    } else {
      appendStoredOrganizerEvent(eventToStore);
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

  function handleAddShowTime() {
    setShowTimes((current) => [
      ...current,
      {
        id: Date.now(),
        start: "2026-05-08T06:00",
        end: "2026-05-15T00:05",
        tickets: [],
      },
    ]);
  }

  function handleRemoveShowTime(id: number) {
    setShowTimes((current) => current.filter((showTime) => showTime.id !== id));
  }

  function handleChangeShowTime(id: number, field: "start" | "end", value: string) {
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

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-background text-foreground">
      <OrganizerWizardHeader
        currentStep={currentStep}
        stepLabels={stepLabels}
        onNext={goToNextStep}
        onStepSelect={handleStepSelect}
      />

      <div className="px-4 pt-32 pb-10 md:px-6 lg:px-10 xl:px-11">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {currentStep === 0 ? (
              <EventInfoStep
                eventName={eventName}
                eventCategory={eventCategory}
                eventCategoryOptions={eventCategoryOptions}
                bannerImageUrl={bannerImageUrl || existingBannerImageUrl}
                eventLocationMode={eventLocationMode}
                filteredProvinceOptions={filteredProvinceOptions}
                filteredWardOptions={filteredWardOptions}
                provinceCode={provinceCode}
                provinceSearch={provinceSearch}
                selectedEventCategory={selectedEventCategory}
                selectedProvince={selectedProvince}
                selectedWard={selectedWard}
                wardCode={wardCode}
                wardSearch={wardSearch}
                venueName={venueName}
                streetAddress={streetAddress}
                onEventCategoryChange={handleEventCategoryChange}
                onEventNameChange={setEventName}
                onBannerImageChange={handleBannerImageChange}
                onLocationModeChange={handleLocationModeChange}
                onProvinceSearchChange={setProvinceSearch}
                onProvinceSelect={handleProvinceChange}
                onWardSearchChange={setWardSearch}
                onWardSelect={handleWardChange}
                onVenueNameChange={setVenueName}
                onStreetAddressChange={setStreetAddress}
                // Organizer info
                organizerName={organizerName}
                organizerDescription={organizerDescription}
                organizerLogoUrl={organizerLogoUrl || existingOrganizerLogoUrl}
                onOrganizerNameChange={setOrganizerName}
                onOrganizerDescriptionChange={setOrganizerDescription}
                onOrganizerLogoChange={(url, file) => {
                  setOrganizerLogoUrl(url);
                  setOrganizerLogoFile(file);
                }}
                // Event description
                eventDescription={eventDescription}
                onEventDescriptionChange={setEventDescription}
              />
            ) : currentStep === 1 ? (
              <TimeAndTicketsStep
                showTimes={showTimes}
                onAddShowTime={handleAddShowTime}
                onRemoveShowTime={handleRemoveShowTime}
                onChangeShowTime={handleChangeShowTime}
                onCreateTicketType={handleOpenCreateTicket}
                onEditTicketType={handleOpenEditTicket}
                onRemoveTicketType={handleRemoveTicket}
              />
            ) : currentStep === 2 ? (
              <SettingsStep eventSequenceId={eventSequenceId} />
            ) : (
              <PaymentInfoStep />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {ticketModalState.showTimeId !== null && (
        <TicketTypeModal
          key={`${ticketModalState.showTimeId}-${ticketModalState.ticket?.id ?? "new"}`}
          initialTicket={ticketModalState.ticket}
          onClose={handleCloseTicketModal}
          onSave={handleSaveTicket}
        />
      )}
    </div>
  );
}
