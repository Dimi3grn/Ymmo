import { useState, type ImgHTMLAttributes } from "react";

/** Image de repli locale (toujours versionnée) affichée si la photo est cassée/manquante. */
export const PLACEHOLDER_IMAGE = "/images/biens/placeholder.svg";

type Props = ImgHTMLAttributes<HTMLImageElement> & { src?: string };

/**
 * <img> robuste : bascule automatiquement sur un placeholder local si l'image
 * échoue à charger (URL externe expirée, 404…), pour ne jamais afficher l'icône
 * d'image cassée du navigateur. `loading="lazy"` et `decoding="async"` par défaut.
 *
 * On mémorise la source qui a échoué (et non un simple booléen) afin que changer
 * de photo — ex. une galerie — réaffiche bien la nouvelle source sans effet.
 */
export default function SafeImage({ src, alt = "", loading = "lazy", onError, ...rest }: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const resolved = !src || failedSrc === src ? PLACEHOLDER_IMAGE : src;

  return (
    <img
      src={resolved}
      alt={alt}
      loading={loading}
      decoding="async"
      onError={(e) => {
        if (src && failedSrc !== src) setFailedSrc(src);
        onError?.(e);
      }}
      {...rest}
    />
  );
}
