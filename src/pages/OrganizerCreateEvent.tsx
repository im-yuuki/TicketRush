import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState, type Key } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
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
import { appendStoredOrganizerEvent } from "../utils/organizerEventsStorage";
import { filterLocationOptions } from "../utils/organizerLocationSearch";

export default function OrganizerCreateEvent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [eventName, setEventName] = useState("");
  const [eventCategory, setEventCategory] = useState<EventCategory | "">("");
  const [eventLocationMode, setEventLocationMode] = useState<EventLocationMode>("offline");
  const [provinceCode, setProvinceCode] = useState("");
  const [wardCode, setWardCode] = useState("");
  const [provinceSearch, setProvinceSearch] = useState("");
  const [wardSearch, setWardSearch] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [showTimes, setShowTimes] = useState<ShowTime[]>([]);
  const [ticketModalState, setTicketModalState] = useState<{
    showTimeId: number | null;
    ticket: TicketTypeData | null;
  }>({ showTimeId: null, ticket: null });

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
    setProvinceCode(key.toString());
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

  function completeCreateEvent() {
    const firstShowTime = showTimes[0];

    appendStoredOrganizerEvent({
      id: `organizer-event-${Date.now()}`,
      title: eventName.trim() || t("organizer.create.untitledEvent", "Sự kiện chưa đặt tên"),
      status: t("organizer.events.tabs.pending", "Chờ duyệt"),
      start: firstShowTime?.start || new Date().toISOString(),
      end: firstShowTime?.end,
      showtimeCount: showTimes.length,
      ticketTypeCount: showTimes.reduce((total, showTime) => total + showTime.tickets.length, 0),
      createdAt: new Date().toISOString(),
    });
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
                onEventCategoryChange={handleEventCategoryChange}
                onEventNameChange={setEventName}
                onLocationModeChange={handleLocationModeChange}
                onProvinceSearchChange={setProvinceSearch}
                onProvinceSelect={handleProvinceChange}
                onWardSearchChange={setWardSearch}
                onWardSelect={handleWardChange}
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
              <SettingsStep />
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
