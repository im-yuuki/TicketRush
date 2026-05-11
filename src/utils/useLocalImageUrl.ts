import { useEffect, useState } from "react";
import { readLocalImageBlob } from "./localImageStorage";

export function useLocalImageUrl(imageKey?: string) {
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    let active = true;
    let objectUrl = "";

    queueMicrotask(() => {
      if (active) setImageUrl("");
    });

    if (!imageKey) {
      return () => {
        active = false;
      };
    }

    readLocalImageBlob(imageKey)
      .then((blob) => {
        if (!active || !blob) return;

        objectUrl = URL.createObjectURL(blob);
        setImageUrl(objectUrl);
      })
      .catch(() => {
        if (active) setImageUrl("");
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [imageKey]);

  return imageUrl;
}
