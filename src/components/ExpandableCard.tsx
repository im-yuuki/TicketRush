import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@heroui/react";
import { ChevronDown } from "lucide-react";

type ExpandableCardProps = {
  title: ReactNode;
  children: ReactNode;
  /** Max height (px) when collapsed. Default: 240. */
  collapsedHeight?: number;
  /** Card variant passed through to heroui Card. */
  variant?: "default" | "secondary" | "tertiary" | "transparent";
  className?: string;
  /** Optional action rendered on the right side of the header. */
  headerAction?: ReactNode;
};

export default function ExpandableCard({
  title,
  children,
  collapsedHeight = 240,
  variant = "default",
  className,
  headerAction,
}: ExpandableCardProps) {
  const { t } = useTranslation();
  const contentRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);

  // Measure content height to decide whether the toggle is needed.
  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const update = () => {
      setOverflowing(el.scrollHeight > collapsedHeight + 4);
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [collapsedHeight, children]);

  // Re-measure when images inside finish loading.
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const imgs = el.querySelectorAll("img");
    const handler = () => {
      setOverflowing(el.scrollHeight > collapsedHeight + 4);
    };
    imgs.forEach((img) => img.addEventListener("load", handler));
    return () => {
      imgs.forEach((img) => img.removeEventListener("load", handler));
    };
  }, [collapsedHeight, children]);

  const showToggle = overflowing;
  const isCollapsed = showToggle && !expanded;

  const expandLabel = t("common.expand", "Xem thêm");
  const collapseLabel = t("common.collapse", "Thu gọn");
  const toggleLabel = expanded ? collapseLabel : expandLabel;

  return (
    <Card variant={variant} className={className}>
      <Card.Header className="flex-row items-center justify-between gap-2 border-b border-border pb-3">
        <Card.Title className="text-base font-semibold">{title}</Card.Title>
        {headerAction}
      </Card.Header>

      <Card.Content className="relative p-0">
        <div
          ref={contentRef}
          style={{
            maxHeight: isCollapsed ? `${collapsedHeight}px` : undefined,
          }}
          className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
        >
          {children}
        </div>

        {isCollapsed && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-surface to-transparent"
          />
        )}
      </Card.Content>

      {showToggle && (
        <Card.Footer className="justify-center border-t border-border pt-3">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-label={toggleLabel}
            title={toggleLabel}
            className="flex items-center justify-center rounded-full p-1 text-muted transition-colors hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <ChevronDown
              className={`size-5 transition-transform duration-300 ${expanded ? "rotate-180" : ""
                }`}
            />
          </button>
        </Card.Footer>
      )}
    </Card>
  );
}
