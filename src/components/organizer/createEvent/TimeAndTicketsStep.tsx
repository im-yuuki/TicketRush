import { Button, Card, Input } from "@heroui/react";
import {
  ChevronDown,
  CirclePlus,
  Grip,
  Pencil,
  Ticket,
  Trash2,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ShowTime, TicketTypeData } from "../../../types/organizerCreate";
import {
  OrganizerFieldLabel,
  OrganizerSelectLike,
} from "../OrganizerFormControls";

export default function TimeAndTicketsStep({
  showTimes,
  onAddShowTime,
  onRemoveShowTime,
  onChangeShowTime,
  onCreateTicketType,
  onEditTicketType,
  onRemoveTicketType,
}: {
  showTimes: ShowTime[];
  onAddShowTime: () => void;
  onRemoveShowTime: (id: number) => void;
  onChangeShowTime: (id: number, field: "start" | "end", value: string) => void;
  onCreateTicketType: (showTimeId: number) => void;
  onEditTicketType: (showTimeId: number, ticket: TicketTypeData) => void;
  onRemoveTicketType: (showTimeId: number, ticketId: number) => void;
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
          {showTimes.map((showTime, index) => {
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
                      <h3 className="text-xl font-bold">
                        {t("organizer.create.showtimeDate", "Ngày sự kiện")} {index + 1}
                      </h3>
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

                    <div className="flex min-h-16 items-center justify-center">
                      <Button
                        type="button"
                        variant="tertiary"
                        className="text-accent hover:bg-accent/10"
                        onClick={() => onCreateTicketType(showTime.id)}
                      >
                        <CirclePlus className="size-5" />
                        {t("organizer.create.createTicketType", "Tạo loại vé mới")}
                      </Button>
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
