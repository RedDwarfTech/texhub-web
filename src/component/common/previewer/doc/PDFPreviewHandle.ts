import styles from "./MemoizedPDFPreview.module.css";

export const goPage = (i: number) => {
  let element = document.querySelectorAll(`.${styles.pdfPage}`);
  if (element && element.length > 0 && i) {
    element[i - 1]!.scrollIntoView({ behavior: "smooth" });
  }
};