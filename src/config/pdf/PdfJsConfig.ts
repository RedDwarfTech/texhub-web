import { pdfjs } from "react-pdf";
import { getAccessToken } from "@/component/common/cache/Cache";
import { Options } from "react-pdf/dist/cjs/shared/types";

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
}

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
  if (cachedOptions && cachedOptions.httpHeaders 
    && cachedOptions.httpHeaders.hasOwnProperty('Authorization') 
    && getAuthorization(cachedOptions.httpHeaders) === "Bearer " + getAccessToken()) {
    return cachedOptions;
  }

  // 生成新的 pdfjsOptions
  cachedOptions = {
    cMapUrl: `/pdfjs-dist/${pdfjs.version}/cmaps/`,
    httpHeaders: {
      Authorization: "Bearer " + getAccessToken(),
    },
    disableRange: false,
    disableAutoFetch: true,
    rangeChunkSize: 65536 * 5,
  };

  return cachedOptions;
};

const getAuthorization = (headers: Object): any => {
  if ('Authorization' in headers) {
    return headers.Authorization;
  }
  return undefined;
}