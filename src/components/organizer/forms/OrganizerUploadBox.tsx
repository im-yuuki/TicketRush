import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { ImagePlus } from "lucide-react";
import { useTranslation } from "react-i18next";

function parseImageDimensions(size: string) {
  const match = size.match(/^(\d+)\s*x\s*(\d+)$/i);
  if (!match) return null;
  return {
    width: Number(match[1]),
    height: Number(match[2]),
  };
}

export type OrganizerUploadedImage = {
  url: string;
  file: File;
  name: string;
  width: number;
  height: number;
};

export function OrganizerUploadBox({
  title,
  size,
  className = "",
  imageUrl = "",
  onImageAccepted,
}: {
  title: string;
  size: string;
  className?: string;
  imageUrl?: string;
  onImageAccepted?: (image: OrganizerUploadedImage) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef("");
  const validationIdRef = useRef(0);
  const { t } = useTranslation();
  const [previewUrl, setPreviewUrl] = useState("");
  const [selectedImageName, setSelectedImageName] = useState("");
  const [selectedImageSize, setSelectedImageSize] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const expectedDimensions = parseImageDimensions(size);
  const displayedImageUrl = previewUrl || imageUrl;

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  function clearCurrentPreview() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = "";
    }

    setPreviewUrl("");
    setSelectedImageName("");
    setSelectedImageSize("");
  }

  function resetInput() {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleUploadClick() {
    inputRef.current?.click();
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;

    const validationId = validationIdRef.current + 1;
    validationIdRef.current = validationId;
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      if (validationIdRef.current !== validationId) {
        URL.revokeObjectURL(objectUrl);
        return;
      }

      const actualSize = `${image.naturalWidth}x${image.naturalHeight}`;
      if (
        expectedDimensions &&
        (image.naturalWidth !== expectedDimensions.width ||
          image.naturalHeight !== expectedDimensions.height)
      ) {
        URL.revokeObjectURL(objectUrl);
        setErrorMessage(
          t("organizer.create.imageSizeError", "Ảnh phải đúng kích thước {{size}}. Ảnh bạn chọn là {{actualSize}}.", { size, actualSize }),
        );
        resetInput();
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        if (validationIdRef.current !== validationId) {
          URL.revokeObjectURL(objectUrl);
          return;
        }

        if (typeof reader.result !== "string") {
          URL.revokeObjectURL(objectUrl);
          setErrorMessage(t("organizer.create.imageReadError", "Không đọc được ảnh. Vui lòng chọn ảnh khác."));
          resetInput();
          return;
        }

        clearCurrentPreview();
        previewUrlRef.current = objectUrl;
        setPreviewUrl(objectUrl);
        setSelectedImageName(file.name);
        setSelectedImageSize(actualSize);
        setErrorMessage("");
        onImageAccepted?.({
          url: reader.result,
          file,
          name: file.name,
          width: image.naturalWidth,
          height: image.naturalHeight,
        });
        resetInput();
      };

      reader.onerror = () => {
        if (validationIdRef.current === validationId) {
          URL.revokeObjectURL(objectUrl);
          setErrorMessage(t("organizer.create.imageReadError", "Không đọc được ảnh. Vui lòng chọn ảnh khác."));
          resetInput();
        }
      };

      reader.readAsDataURL(file);
    };

    image.onerror = () => {
      if (validationIdRef.current !== validationId) {
        URL.revokeObjectURL(objectUrl);
        return;
      }

      URL.revokeObjectURL(objectUrl);
      setErrorMessage(t("organizer.create.imageReadError", "Không đọc được ảnh. Vui lòng chọn ảnh khác."));
      resetInput();
    };

    image.src = objectUrl;
  }

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleFileChange}
      />
      <button
        type="button"
        className={`group relative flex min-h-72 w-full flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-border bg-surface-secondary p-6 text-center text-foreground transition-colors hover:bg-surface-tertiary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${className}`}
        onClick={handleUploadClick}
      >
        {displayedImageUrl ? (
          <>
            <img
              src={displayedImageUrl}
              alt={selectedImageName || title}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <span className="absolute inset-x-0 bottom-0 bg-black/70 px-4 py-3 text-left text-white backdrop-blur-sm">
              <span className="block truncate text-sm font-semibold">
                {selectedImageName || title}
              </span>
              <span className="block text-xs text-white/80">
                {selectedImageSize || size} - {t("organizer.create.clickToChangeImage", "Nhấn để đổi ảnh")}
              </span>
            </span>
          </>
        ) : (
          <>
            <ImagePlus className="size-11 text-accent" strokeWidth={2.25} />
            <span className="max-w-56 text-base font-semibold leading-6">
              {title}
              <strong className="mt-1 block text-sm">({size})</strong>
            </span>
          </>
        )}
      </button>
      {errorMessage ? (
        <p className="text-sm font-medium text-danger">{errorMessage}</p>
      ) : null}
    </div>
  );
}
