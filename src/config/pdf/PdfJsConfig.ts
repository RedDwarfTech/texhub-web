import { pdfjs } from "react-pdf";
import { getAccessToken } from "@/component/common/cache/Cache";
import { Options } from "react-pdf/dist/shared/types";

export const pdfJsOptions: Options = {
  cMapUrl: `/pdfjs-dist/${pdfjs.version}/cmaps/`,
  httpHeaders: {
    Authorization: "Bearer " + getAccessToken(),
  },
  // open the range request
  // the default value was false
  // if want to load the whole pdf by default
  // set this value to true
  disableRange: false,
  // just fetch the needed slice
  disableAutoFetch: true,
  rangeChunkSize: 65536 * 5,
};

/**
 * here we should use the function not a const value
 * because the const value will cached the expired access token
 * that will make the pdf request failed in the future
 * @returns
 */
export const getPdfjsOptionsLegacy = (): Options => {
  return {
    cMapUrl: `/pdfjs-dist/${pdfjs.version}/cmaps/`,
    httpHeaders: {
      Authorization: "Bearer " + getAccessToken(),
    },
    // open the range request
    // the default value was false
    // if want to load the whole pdf by default
    // set this value to true
    disableRange: false,
    // just fetch the needed slice
    disableAutoFetch: true,
    rangeChunkSize: 65536 * 5,
  };
};

let cachedOptions: Options | null = null;

export const getPdfjsOptions = (): Options => {
  // 检查缓存是否已存在并且 token 是否有效
  // https://stackoverflow.com/questions/79019061/how-to-get-the-newest-access-token-everytime-when-using-pdf-js-to-fetch-pdf
  if (
    cachedOptions &&
    cachedOptions.httpHeaders &&
    cachedOptions.httpHeaders.hasOwnProperty("Authorization") &&
    getAuthorization(cachedOptions.httpHeaders) === "Bearer " + getAccessToken()
  ) {
    return cachedOptions;
  }

  // 生成新的 pdfjsOptions
  cachedOptions = {
    cMapUrl: `/pdfjs-dist/${pdfjs.version}/web/cmaps/`,
    standardFontDataUrl: "/standard_fonts/",
    httpHeaders: {
      Authorization: "Bearer " + getAccessToken(),
    },
    disableRange: false,
    disableAutoFetch: true,
    rangeChunkSize: 65536 * 5,
  };

  return cachedOptions;
};

export const getAuthorization = (headers: Object): any => {
  if ("Authorization" in headers) {
    return headers.Authorization;
  }
  return undefined;
};

export const authTokenEquals = (pdfOptions: Options): boolean => {
  if (!pdfOptions.httpHeaders) {
    return false;
  }
  if (
    getAuthorization(pdfOptions.httpHeaders) !==
    "Bearer " + getAccessToken()
  ) {
    return false;
  }
  return true;
};
