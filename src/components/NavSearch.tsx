import { Avatar, Button, Card, Input, Skeleton } from "@heroui/react";
import { BadgeCheck, ImageOff, MapPin, Search, X } from "lucide-react";
import { useEffect, useState, type SubmitEvent } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { searchFeeds } from "../api/feeds";
import type { SearchResult } from "../types/requestDto";

const SEARCH_LIMIT = 20;

function getInitials(value: string | null | undefined) {
  return (value ?? "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "TR";
}

function SearchResultMedia({ result }: { result: SearchResult }) {
  const isOrganization = result.type === "ORGANIZATION";
  const hasBanner = (result.bannerUrl?.length ?? 0) > 0;

  if (isOrganization) {
    return (
      <Avatar className="size-14 shrink-0 rounded-full">
        <Avatar.Image src={result.avatarUrl ?? ""} />
        <Avatar.Fallback>{getInitials(result.name)}</Avatar.Fallback>
      </Avatar>
    );
  }

  return (
    <div className="flex aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-lg bg-surface-secondary text-muted">
      {hasBanner ? (
        <img
          src={result.bannerUrl ?? ""}
          alt={result.name ?? ""}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <ImageOff className="size-5 opacity-60" />
        </div>
      )}
    </div>
  );
}

function SearchResultItem({
  result,
  onSelect,
}: {
  result: SearchResult;
  onSelect: (result: SearchResult) => void;
}) {
  const { t } = useTranslation();
  const isEvent = result.type === "EVENT";
  const isOrganization = result.type === "ORGANIZATION";
  const isClickable = isEvent && result.id !== null;
  const typeLabel = isOrganization
    ? t("search.organization", "Organization")
    : t("search.event", "Event");
  const resultBody = (
    <>
      <SearchResultMedia result={result} />
      <div className="min-w-0 flex-1 text-left">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-foreground md:text-base">
            {result.name || t("search.unnamed", "Untitled")}
          </p>
          {isOrganization && result.verified && (
            <BadgeCheck className="size-4 shrink-0 text-success" />
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
          <span className="rounded-full bg-surface-secondary px-2 py-0.5 font-medium">
            {typeLabel}
          </span>
          {result.venue && (
            <span className="inline-flex min-w-0 items-center gap-1">
              <MapPin className="size-3 shrink-0" />
              <span className="truncate">{result.venue}</span>
            </span>
          )}
          {isOrganization && (
            <span>{t("search.organizationUnavailable", "Profile link coming soon")}</span>
          )}
        </div>
      </div>
    </>
  );

  if (!isClickable) {
    return (
      <div className="flex w-full items-center gap-3 rounded-xl px-3 py-3">
        {resultBody}
      </div>
    );
  }

  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-surface-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      onClick={() => onSelect(result)}
    >
      {resultBody}
    </button>
  );
}

export default function NavSearch({ variant = "full" }: { variant?: "icon" | "full" }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchLabel = t("navigation.searchLabel", "Search");
  const searchPlaceholder = t("navigation.searchPlaceholder", "Search events, organizers, ...");
  const trimmedQuery = query.trim();

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (!trimmedQuery) return;

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await searchFeeds(trimmedQuery, SEARCH_LIMIT);
        if (!cancelled) setResults(data ?? []);
      } catch (searchError) {
        if (!cancelled) {
          setResults([]);
          setError(searchError instanceof Error ? searchError.message : t("search.error", "Search failed"));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [isOpen, trimmedQuery, t]);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  function handleQueryChange(value: string) {
    setQuery(value);

    if (!value.trim()) {
      setResults([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setError(null);
  }

  function handleSelect(result: SearchResult) {
    if (result.type !== "EVENT" || result.id === null) return;

    setIsOpen(false);
    navigate(`/events/${result.id}`);
  }

  const overlay = isOpen ? (
    <div
      className="fixed inset-0 z-[80] overflow-y-auto bg-background/95 px-4 py-5 backdrop-blur-sm sm:py-8"
      role="dialog"
      aria-modal="true"
      aria-label={searchLabel}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setIsOpen(false);
      }}
    >
      <Card className="mx-auto w-full max-w-3xl border border-border bg-surface shadow-2xl">
        <Card.Header className="flex-row items-center gap-3 border-b border-border p-3 md:p-4">
          <form onSubmit={handleSubmit} className="min-w-0 flex-1">
            <Input
              autoFocus
              value={query}
              onInput={(event) => handleQueryChange(event.currentTarget.value)}
              aria-label={searchLabel}
              placeholder={searchPlaceholder}
              className="w-full border border-border transition-colors rounded-full"
            />
          </form>
          <Button
            type="button"
            variant="tertiary"
            isIconOnly={true}
            aria-label={t("search.close", "Close search")}
            onClick={() => setIsOpen(false)}
          >
            <X className="size-5" />
          </Button>
        </Card.Header>

        <Card.Content className="max-h-[calc(100dvh-9rem)] gap-2 overflow-y-auto p-3 md:p-4">
          {!trimmedQuery && (
            <p className="rounded-xl bg-surface-secondary/60 px-4 py-6 text-center text-sm text-muted">
              {t("search.startTyping", "Start typing to search events and organizers.")}
            </p>
          )}

          {trimmedQuery && isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3 rounded-xl px-3 py-3">
                  <Skeleton className="h-[60px] w-20 rounded-lg" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/5 rounded-lg" />
                    <Skeleton className="h-3 w-2/5 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {trimmedQuery && error && !isLoading && (
            <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
            </p>
          )}

          {trimmedQuery && !error && !isLoading && results.length === 0 && (
            <p className="rounded-xl bg-surface-secondary/60 px-4 py-6 text-center text-sm text-muted">
              {t("search.empty", "No matching results found.")}
            </p>
          )}

          {trimmedQuery && !error && !isLoading && results.length > 0 && (
            <div className="divide-y divide-border">
              {results.map((result, index) => (
                <SearchResultItem
                  key={`${result.type ?? "unknown"}-${result.id ?? "no-id"}-${index}`}
                  result={result}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          )}
        </Card.Content>
      </Card>
    </div>
  ) : null;

  return (
    <>
      {variant === "icon" ? (
        <Button
          type="button"
          variant="tertiary"
          isIconOnly={true}
          className="h-10 w-10 rounded-full lg:hidden"
          onClick={() => setIsOpen(true)}
          aria-label={searchLabel}
        >
          <Search className="size-4" />
        </Button>
      ) : (
        <Button
          type="button"
          variant="tertiary"
          className="hidden w-full max-w-xl justify-center rounded-full px-4 text-muted lg:flex"
          onClick={() => setIsOpen(true)}
          aria-label={searchLabel}
        >
          <Search className="size-4 shrink-0" />
          <span className="truncate text-sm font-normal">{searchPlaceholder}</span>
        </Button>
      )}
      {overlay && createPortal(overlay, document.body)}
    </>
  );
}
