export const isDevModel = (): boolean => {
  let devModelFlag = localStorage.getItem("devModel");
  if (devModelFlag && Boolean(devModelFlag) === true) {
    return true;
  } else {
    return false;
  }
};

export const isEnableSubDoc = (): boolean => {
  let subDocFlag = localStorage.getItem("subdoc");
  if (subDocFlag && subDocFlag === "subdoc") {
    return true;
  }
  return false;
};