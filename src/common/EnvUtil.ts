export const isDevModel = (): boolean => {
  let devModelFlag = localStorage.getItem("devModel");
  if (devModelFlag && Boolean(devModelFlag) === true) {
    return true;
  } else {
    return false;
  }
};

