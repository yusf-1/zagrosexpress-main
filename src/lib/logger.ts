const isProd = import.meta.env.PROD;

export const log = (...args: unknown[]) => {
  if (!isProd) {
    console.log(...args);
  }
};

export const warn = (...args: unknown[]) => {
  if (!isProd) {
    console.warn(...args);
  }
};

export const error = (...args: unknown[]) => {
  if (!isProd) {
    console.error(...args);
  }
};
