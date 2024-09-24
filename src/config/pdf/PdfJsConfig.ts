import { pdfjs } from "react-pdf";
import { getAccessToken } from "@/component/common/cache/Cache";
import { Options } from "react-pdf/dist/cjs/shared/types";

/**
 * here we should use the function not a const value
 * because the const value will cached the expired access token
 * that will make the pdf request failed in the future
 * @returns 
 */
export const getPdfjsOptions = (): Options => {
  return {
    cMapUrl: `/pdfjs-dist/${pdfjs.version}/cmaps/`,
    httpHeaders: {
      Authorization: "Bearer " + getAccessToken(), // 每次调用时获取最新 token
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