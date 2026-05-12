import { Button, Card, Input } from "@heroui/react";
import {
  ChevronDown,
  CirclePlus,
  Download,
  Grip,
  Pencil,
  Ticket,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { ShowTime, TicketTypeData } from "../../../types/organizerCreate";
import {
  OrganizerFieldLabel,
  OrganizerSelectLike,
} from "../OrganizerFormControls";

function ShowtimeTitle({
  name,
  onSave,
}: {
  name: string;
  onSave: (value: string) => void;
}) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);

  function handleStartEdit() {
    setDraft(name);
    setEditing(true);
  }

  function handleFinishEdit() {
    setEditing(false);
    onSave(draft.trim() || name);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      handleFinishEdit();
    }
    if (event.key === "Escape") {
      setEditing(false);
    }
  }

  if (editing) {
    return (
      <input
        autoFocus
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleFinishEdit}
        onKeyDown={handleKeyDown}
        className="w-full min-w-0 rounded-md border border-border bg-white px-2 py-1 text-xl font-bold text-slate-900 outline-none focus:border-accent"
      />
    );
  }

  return (
    <h3
      role="button"
      tabIndex={0}
      onClick={handleStartEdit}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleStartEdit();
      }}
      className="cursor-pointer rounded-md px-2 py-1 text-xl font-bold transition-colors hover:bg-surface-secondary"
      title={t("organizer.create.clickToRenameShowtime", "Nhấn để đổi tên suất diễn")}
    >
      {name}
    </h3>
  );
}

function ImportTicketsDropdown({
  showTimes,
  currentShowTimeId,
  onImport,
}: {
  showTimes: ShowTime[];
  currentShowTimeId: number;
  onImport: (targetId: number, sourceId: number) => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const currentIndex = showTimes.findIndex((st) => st.id === currentShowTimeId);
  const availableSources = showTimes
    .slice(0, currentIndex)
    .filter((st) => st.tickets.length > 0);

  if (availableSources.length === 0) return null;

  function handleImport(sourceId: number) {
    onImport(currentShowTimeId, sourceId);
    setOpen(false);
  }

  return (
    <div className="relative">
      <Button
        type="button"
        variant="tertiary"
        className="text-accent hover:bg-accent/10"
        onClick={() => setOpen((prev) => !prev)}
      >
        <Download className="size-5" />
        {t("organizer.create.importFromShowtime", "Nhập từ suất diễn đã có")}
      </Button>
      {open && (
        <div className="absolute bottom-full left-0 mb-2 z-10 min-w-[220px] rounded-lg border border-border bg-surface shadow-xl">
          {availableSources.map((source) => (
            <button
              key={source.id}
              type="button"
              onClick={() => handleImport(source.id)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors first:rounded-t-lg last:rounded-b-lg hover:bg-surface-secondary"
            >
              <Ticket className="size-4 shrink-0 text-muted" />
              <div className="min-w-0">
                <p className="font-medium">{source.name}</p>
                <p className="text-xs text-muted">
                  {t("organizer.create.importTicketsCount", "{{count}} loại vé", { count: source.tickets.length })}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TimeAndTicketsStep({
  showTimes,
  onAddShowTime,
  onRemoveShowTime,
  onChangeShowTime,
  onCreateTicketType,
  onEditTicketType,
  onRemoveTicketType,
  onImportTicketsFromShowTime,
}: {
  showTimes: ShowTime[];
  onAddShowTime: () => void;
  onRemoveShowTime: (id: number) => void;
  onChangeShowTime: (id: number, field: "start" | "end" | "name", value: string) => void;
  onCreateTicketType: (showTimeId: number) => void;
  onEditTicketType: (showTimeId: number, ticket: TicketTypeData) => void;
  onRemoveTicketType: (showTimeId: number, ticketId: number) => void;
  onImportTicketsFromShowTime: (targetShowTimeId: number, sourceShowTimeId: number) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-[1434px] space-y-7">
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold">
          {t("organizer.create.timeAndTicketTitle", "Thời gian và Loại vé")}
        </h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="tertiary"
            className="border border-accent text-accent hover:bg-accent/10"
            onClick={onAddShowTime}
          >
            {t("organizer.create.createShowtime", "Tạo suất diễn")}
            <CirclePlus className="size-4" />
          </Button>
          <div className="min-w-44">
            <OrganizerSelectLike placeholder={t("organizer.create.allShowtimes", "Tất cả")} />
          </div>
        </div>
      </section>

      {showTimes.length === 0 ? (
        <Card className="border border-dashed border-border bg-surface text-foreground">
          <Card.Content className="items-center gap-4 p-10 text-center">
            <p className="text-sm text-muted">
              {t(
                "organizer.create.noShowtimes",
                "Chưa có suất diễn nào. Hãy tạo suất diễn đầu tiên.",
              )}
            </p>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={onAddShowTime}>
              <CirclePlus className="size-4" />
              {t("organizer.create.createShowtime", "Tạo suất diễn")}
            </Button>
          </Card.Content>
        </Card>
      ) : (
        <div className="space-y-5">
          {showTimes.map((showTime) => {
            const complete = Boolean(showTime.start && showTime.end && showTime.tickets.length > 0);

            return (
              <Card
                key={showTime.id}
                className={`border bg-surface text-foreground ${complete ? "border-accent" : "border-danger"}`}
              >
                <Card.Content className="gap-8 p-5 md:p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <ChevronDown className="size-5 rotate-180 text-muted" />
                      <ShowtimeTitle
                        name={showTime.name}
                        onSave={(value) => onChangeShowTime(showTime.id, "name", value)}
                      />
                    </div>
                    <button
                      type="button"
                      className="rounded-full p-2 text-danger transition-colors hover:bg-danger/10"
                      aria-label={t("organizer.create.removeShowtime", "Xóa suất diễn")}
                      onClick={() => onRemoveShowTime(showTime.id)}
                    >
                      <X className="size-5" />
                    </button>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <OrganizerFieldLabel>{t("organizer.create.startTime", "Thời gian bắt đầu")}</OrganizerFieldLabel>
                      <Input
                        type="datetime-local"
                        value={showTime.start}
                        onInput={(event) => onChangeShowTime(showTime.id, "start", event.currentTarget.value)}
                        className="w-full rounded-md border border-border bg-white text-slate-900"
                      />
                    </div>
                    <div className="space-y-2">
                      <OrganizerFieldLabel>{t("organizer.create.endTime", "Thời gian kết thúc")}</OrganizerFieldLabel>
                      <Input
                        type="datetime-local"
                        value={showTime.end}
                        onInput={(event) => onChangeShowTime(showTime.id, "end", event.currentTarget.value)}
                        className="w-full rounded-md border border-border bg-white text-slate-900"
                      />
                    </div>
                  </div>

                  <section className="space-y-7">
                    <h4 className="text-xl font-bold">
                      <span className="text-danger">*</span>{" "}
                      {t("organizer.create.ticketTypes", "Loại vé")}
                    </h4>

                    {showTime.tickets.length > 0 && (
                      <div className="space-y-4">
                        {showTime.tickets.map((ticket) => (
                          <div
                            key={ticket.id}
                            className="flex min-h-20 items-center justify-between gap-4 rounded-lg bg-surface-secondary px-5 py-4"
                          >
                            <div className="flex min-w-0 items-center gap-4">
                              <Grip className="size-5 shrink-0 text-muted" />
                              <Ticket className="size-6 shrink-0 text-foreground" />
                              <span className="truncate text-base font-medium">{ticket.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                className="flex size-10 items-center justify-center rounded-md bg-white text-slate-900 transition-colors hover:bg-white/90"
                                aria-label={t("organizer.create.ticketModal.editTicket", "Sửa loại vé")}
                                onClick={() => onEditTicketType(showTime.id, ticket)}
                              >
                                <Pencil className="size-4" />
                              </button>
                              <button
                                type="button"
                                className="flex size-10 items-center justify-center rounded-md bg-danger text-danger-foreground transition-colors hover:bg-danger/90"
                                aria-label={t("organizer.create.ticketModal.deleteTicket", "Xóa loại vé")}
                                onClick={() => onRemoveTicketType(showTime.id, ticket.id)}
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex min-h-16 items-center justify-center gap-3">
                      <Button
                        type="button"
                        variant="tertiary"
                        className="text-accent hover:bg-accent/10"
                        onClick={() => onCreateTicketType(showTime.id)}
                      >
                        <CirclePlus className="size-5" />
                        {t("organizer.create.createTicketType", "Tạo loại vé mới")}
                      </Button>
                      {showTime.tickets.length === 0 && (
                        <ImportTicketsDropdown
                          showTimes={showTimes}
                          currentShowTimeId={showTime.id}
                          onImport={onImportTicketsFromShowTime}
                        />
                      )}
                    </div>
                  </section>
                </Card.Content>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
