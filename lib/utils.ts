import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export const callApi = async (path: string, options?: RequestInit) => {
  try {
    const resp = await fetch(`${baseUrl}${path}`, options);

    if (resp.ok) {
      return {
        success: true,
        data: await resp.json(),
      };
    } else {
      return {
        success: false,
        error: await resp.json(),
      };
    }
  } catch (err) {
    console.error(err);
    return {
      success: false,
      error: err,
    };
  }
};
