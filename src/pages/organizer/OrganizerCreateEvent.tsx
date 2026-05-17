import { AnimatePresence, motion } from "framer-motion";
import EventInfoStep from "../../components/organizer/createEvent/EventInfoStep";
import OrganizerWizardHeader from "../../components/organizer/createEvent/OrganizerWizardHeader";
import PaymentInfoStep from "../../components/organizer/createEvent/PaymentInfoStep";
import SettingsStep from "../../components/organizer/createEvent/SettingsStep";
import TicketTypeModal from "../../components/organizer/createEvent/TicketTypeModal";
import TimeAndTicketsStep from "../../components/organizer/createEvent/TimeAndTicketsStep";
import { useOrganizerCreateEvent } from "../../hooks/useOrganizerCreateEvent";

export default function OrganizerCreateEvent() {
  const w = useOrganizerCreateEvent();

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-background text-foreground">
      <OrganizerWizardHeader
        currentStep={w.currentStep}
        stepLabels={w.stepLabels}
        onNext={w.goToNextStep}
        onStepSelect={w.handleStepSelect}
        isSubmitting={w.isSubmitting}
      />

      <div className="px-4 pt-32 pb-10 md:px-6 lg:px-10 xl:px-11">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={w.currentStep}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {w.currentStep === 0 ? (
              <EventInfoStep
                eventName={w.eventName}
                eventCategory={w.eventCategory}
                eventCategoryOptions={w.eventCategoryOptions}
                bannerImageUrl={w.bannerImageUrl}
                eventLocationMode={w.eventLocationMode}
                filteredProvinceOptions={w.filteredProvinceOptions}
                filteredWardOptions={w.filteredWardOptions}
                provinceCode={w.provinceCode}
                provinceSearch={w.provinceSearch}
                selectedEventCategory={w.selectedEventCategory}
                selectedProvince={w.selectedProvince}
                selectedWard={w.selectedWard}
                wardCode={w.wardCode}
                wardSearch={w.wardSearch}
                venueName={w.venueName}
                streetAddress={w.streetAddress}
                onEventCategoryChange={w.onEventCategoryChange}
                onEventNameChange={w.onEventNameChange}
                onBannerImageChange={w.onBannerImageChange}
                onLocationModeChange={w.onLocationModeChange}
                onProvinceSearchChange={w.onProvinceSearchChange}
                onProvinceSelect={w.onProvinceSelect}
                onWardSearchChange={w.onWardSearchChange}
                onWardSelect={w.onWardSelect}
                onVenueNameChange={w.onVenueNameChange}
                onStreetAddressChange={w.onStreetAddressChange}
                organizerName={w.organizerName}
                organizerDescription={w.organizerDescription}
                organizerLogoUrl={w.organizerLogoUrl}
                onOrganizerNameChange={w.onOrganizerNameChange}
                onOrganizerDescriptionChange={w.onOrganizerDescriptionChange}
                onOrganizerLogoChange={w.onOrganizerLogoChange}
                eventDescription={w.eventDescription}
                onEventDescriptionChange={w.onEventDescriptionChange}
              />
            ) : w.currentStep === 1 ? (
              <TimeAndTicketsStep
                showTimes={w.showTimes}
                onAddShowTime={w.onAddShowTime}
                onRemoveShowTime={w.onRemoveShowTime}
                onChangeShowTime={w.onChangeShowTime}
                onCreateTicketType={w.onCreateTicketType}
                onEditTicketType={w.onEditTicketType}
                onRemoveTicketType={w.onRemoveTicketType}
                onImportTicketsFromShowTime={w.onImportTicketsFromShowTime}
              />
            ) : w.currentStep === 2 ? (
              <SettingsStep eventSequenceId={w.eventSequenceId} />
            ) : (
              <PaymentInfoStep />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {w.ticketModalState.showTimeId !== null && (
        <TicketTypeModal
          key={`${w.ticketModalState.showTimeId}-${w.ticketModalState.ticket?.id ?? "new"}`}
          initialTicket={w.ticketModalState.ticket}
          onClose={w.onCloseTicketModal}
          onSave={w.onSaveTicket}
        />
      )}
    </div>
  );
}
