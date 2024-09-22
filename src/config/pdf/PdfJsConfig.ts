import { Options } from "react-pdf/dist/cjs/shared/types";
import { pdfjs } from "react-pdf";
import { getAccessToken } from "@/component/common/cache/Cache";

export const pdfjsOptions: Options = {
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
