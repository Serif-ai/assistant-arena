import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export const callApi = async (path: string, options?: RequestInit) => {
  return fetch(`${baseUrl}${path}`, options);
};
