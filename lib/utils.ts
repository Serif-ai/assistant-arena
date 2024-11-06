import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export const callApi = async <T = undefined>(
  path: string,
  options?: RequestInit
): Promise<{ success: true; data: T } | { success: false; error: unknown }> => {
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

export const startDebug = () => {
  const debug: { name: string; time: string }[] = [];
  const start = performance.now();
  let previous = start;

  const pushDebug = (name: string) => {
    const now = performance.now();
    const time = ((now - previous) / 1000).toFixed(4);
    debug.push({
      name,
      time,
    });
    previous = now;
  };

  const endDebug = () => {
    debug.push({
      name: "total",
      time: ((performance.now() - start) / 1000).toFixed(4),
    });
  };

  return {
    debug,
    pushDebug,
    endDebug,
  };
};
