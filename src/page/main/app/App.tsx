import React from "react";
import styles from "./App.module.css";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import queryString, { ParsedQuery } from "query-string";
import AppBody from "./body/AppBody";
import AppHeader from "@/component/header/editor/AppHeader";

const App: React.FC = () => {
  const location = useLocation();
  const search = location.search;
  const params: ParsedQuery = queryString.parse(search);
  const pid: string = params.pid?.toString() || "null";
  const { errors } = useSelector((state: any) => state.rdRootReducer.sys);

  React.useEffect(() => {
    if (errors && errors.msg) {
      console.error("an error occured", errors);
      toast.error(`Error: ${errors.msg}`, { position: "top-right" });
    }
  }, [errors]);

  return (
    <div className={styles.container}>
      <AppHeader></AppHeader>
      <AppBody projectId={pid}></AppBody>
      <ToastContainer />
    </div>
  );
};

export default App;
