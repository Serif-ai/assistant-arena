import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export const callApi = async <T = undefined>(
  path: string,
  options?: RequestInit
): Promise<{ success: boolean; data?: T; error?: unknown }> => {
  try {
    const resp = await fetch(`${baseUrl}${path}`, options);

    try {
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
      return {
        success: false,
        error: err,
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
