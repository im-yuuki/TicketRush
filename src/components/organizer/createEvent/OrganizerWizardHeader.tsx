import { Button } from "@heroui/react";
import { Check, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function OrganizerWizardHeader({
  currentStep,
  stepLabels,
  onNext,
  onStepSelect,
  isSubmitting = false,
  isDisabled = false,
}: {
  currentStep: number;
  stepLabels: string[];
  onNext: () => void;
  onStepSelect: (index: number) => void;
  isSubmitting?: boolean;
  isDisabled?: boolean;
}) {
  const { t } = useTranslation();
  const controlsDisabled = isSubmitting || isDisabled;

  return (
    <div className="fixed top-16 right-0 left-0 z-40 border-b border-border bg-background/95 shadow-sm backdrop-blur supports-backdrop-filter:bg-background/80 lg:left-[284px]">
      <div className="flex min-h-16 flex-col gap-3 px-4 py-3 md:px-6 xl:flex-row xl:items-center xl:justify-between xl:py-0">
        <ol className="grid w-full min-w-0 grid-cols-2 gap-2 md:grid-cols-4 xl:flex-1 xl:gap-4">
          {stepLabels.map((label, index) => {
            const active = index === currentStep;
            const completed = index < currentStep;

            return (
              <li key={label} className="relative min-w-0">
                <button
                  type="button"
                  disabled={controlsDisabled}
                  className={`flex min-h-11 w-full min-w-0 items-center justify-center gap-3 rounded-full px-3 text-center transition-colors ${
                    active ? "bg-surface-secondary/70" : "hover:bg-surface-secondary/50"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                  onClick={() => onStepSelect(index)}
                >
                  <span
                    className={`flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                      active || completed ? "bg-accent text-accent-foreground" : "bg-surface text-foreground"
                    }`}
                  >
                    {completed ? <Check className="size-4" /> : index + 1}
                  </span>
                  <span className="min-w-0 truncate text-center text-sm font-semibold text-foreground md:text-base">
                    {label}
                  </span>
                </button>
                {(active || completed) && (
                  <div className="absolute -bottom-3 left-3 right-3 h-0.5 rounded-full bg-accent" />
                )}
              </li>
            );
          })}
        </ol>

        <div className="flex shrink-0 justify-end gap-3">
          <Button variant="tertiary" className="min-w-16" isDisabled={controlsDisabled}>
            {t("organizer.create.save", "Save")}
          </Button>
          <Button
            className="min-w-28 bg-accent text-accent-foreground hover:bg-accent/90"
            onPress={onNext}
            isDisabled={controlsDisabled}
          >
            {isSubmitting
              ? t("organizer.create.saving", "Saving...")
              : currentStep === stepLabels.length - 1
                ? t("organizer.create.finish", "Finish")
                : t("organizer.create.continue", "Continue")}
            <ChevronRight className="size-4" strokeWidth={2.5} />
          </Button>
        </div>
      </div>
    </div>
  );
}
