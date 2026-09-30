import { UserService } from "rd-component";
import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { joinProject } from "@/service/project/ProjectService";
import {
  InvitePreview,
  previewInvite,
} from "@/service/project/share/ProjectInviteService";

/**
 * 邀请落地页。
 *
 * 这里有两条此前的严重问题，都已改掉：
 *
 * 1. **挂载即入伙**：老代码在 `useEffect(..., [])` 里直接调 `handleJoin()`，
 *    打开链接的瞬间就把自己写进了项目。链接一旦外泄（转发、预加载、聊天软件
 *    的链接预览爬虫）就会静默扩散，而且用户连"发生了什么"都不知道。
 *    现在改为：先展示邀请详情，用户显式点"接受邀请"才入伙。
 *
 * 2. **登录判断形同虚设**：老代码发现未登录时 `navigate("/user/login")` 之后
 *    并没有 return，紧接着仍然执行 `handleJoin()`，等于带着未登录状态去打
 *    入伙接口。现在未登录时停在原地并提示，不发任何入伙请求。
 */
const TeXShareRecieved: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [preview, setPreview] = React.useState<InvitePreview | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [joining, setJoining] = React.useState(false);
  const [invalid, setInvalid] = React.useState(false);
  const loggedIn = UserService.isLoggedIn();

  // 预览邀请内容。preview 是只读接口，登录即可调用 —— 用户此刻还不是成员。
  React.useEffect(() => {
    if (!token) {
      setLoading(false);
      setInvalid(true);
      return;
    }
    if (!UserService.isLoggedIn()) {
      // 未登录不发请求：既省一次注定失败的调用，也避免把"需要登录"
      // 误显示成"链接无效"。
      setLoading(false);
      return;
    }
    previewInvite(token)
      .then((res) => {
        setPreview(res);
      })
      .catch(() => {
        setInvalid(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  const handleJoin = () => {
    if (!token || joining) {
      return;
    }
    setJoining(true);
    joinProject({ token })
      .then((resp: any) => {
        if (!resp) {
          toast.error(t("label_invite_expired"));
          return;
        }
        if (resp.resultCode !== "200") {
          // 无效/已撤销/已过期/次数耗尽都在这里被拦下。
          toast.error(resp.msg || t("label_invite_expired"));
          setInvalid(true);
          return;
        }
        // project_id 来自服务端预览结果，不取自 URL —— URL 里只有一个
        // 不透明的 token，加哪个项目由后端说了算。
        const pid = preview?.project_id;
        if (pid) {
          navigate("/editor?pid=" + pid);
        } else {
          setInvalid(true);
        }
      })
      .catch(() => {
        toast.error(t("label_invite_expired"));
      })
      .finally(() => {
        setJoining(false);
      });
  };

  if (loading) {
    return <div className="p-4">{t("tips_loading")}</div>;
  }

  // 未登录：留在原地等用户登录，避免带着无效会话去打接口。
  if (!loggedIn) {
    return (
      <div className="p-4">
        <div className="mb-3">{t("tips_need_login")}</div>
        <button className="btn btn-primary" onClick={() => navigate("/user/login")}>
          {t("btn_login")}
        </button>
      </div>
    );
  }

  if (invalid || !preview) {
    return (
      <div className="p-4">
        <h5 className="mb-3">{t("title_join_project")}</h5>
        <div>{t("label_invite_expired")}</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h5 className="mb-3">{t("title_join_project")}</h5>
      <div className="mb-2">{t("label_invite_project")}</div>
      <div className="mb-2">
        <strong>{preview.project_name}</strong>
      </div>
      {preview.inviter_name && (
        <div className="mb-2 text-muted">
          {t("label_invited_by")}: {preview.inviter_name}
        </div>
      )}
      {preview.expire_at > 0 && (
        <div className="mb-3 text-muted">
          {t("label_invite_expires_at")}:{" "}
          {new Date(preview.expire_at).toLocaleString()}
        </div>
      )}
      <button className="btn btn-primary" disabled={joining} onClick={handleJoin}>
        {t("btn_accept_invite")}
      </button>
    </div>
  );
};

export default TeXShareRecieved;
