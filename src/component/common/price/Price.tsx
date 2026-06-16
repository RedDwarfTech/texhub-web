import TexHeader from "@/component/header/TexHeader";
import { readConfig } from "@/config/app/config-reader";
import store from "@/redux/store/store";
import { Goods } from "rd-component";
import { useTranslation } from "react-i18next";

const Price: React.FC = () => {
  const { i18n } = useTranslation();

  return (
    <div>
      <TexHeader></TexHeader>
      <Goods
        refreshUrl={readConfig("refreshUserUrl")}
        appId={readConfig("appId")}
        store={store}
        lang={i18n.language}
      ></Goods>
    </div>
  );
};

export default Price;
