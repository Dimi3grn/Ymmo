import axios from "axios";

/**
 * Extrait un message d'erreur lisible d'une exception d'appel API.
 * Renvoie le message renvoyé par le backend si disponible, sinon `fallback`.
 */
export function getApiErrorMessage(err: unknown, fallback = "Une erreur est survenue."): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
  }
  return fallback;
}
