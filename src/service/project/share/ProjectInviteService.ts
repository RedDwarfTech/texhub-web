import { AxiosRequestConfig } from "axios";
import { XHRClient } from "rd-component";

/**
 * 邀请凭证的对外结构，与后端 TexInviteResp 对齐。
 * token 只有签发它的 Owner 能拿到。
 */
export interface InviteToken {
  project_id: string;
  token: string;
  role_id: number;
  /** 0 表示永不过期（毫秒时间戳） */
  expire_at: number;
  /** 0 表示不限次 */
  max_uses: number;
  used_count: number;
  created_time: number;
}

/** 邀请预览，持有链接但尚未加入的用户在"接受"前看到的最小信息集。 */
export interface InvitePreview {
  project_id: string;
  project_name: string;
  inviter_name: string;
  role_id: number;
  /** 0 表示永不过期 */
  expire_at: number;
}

/** 后端统一响应包装。 */
interface ApiResponse<T> {
  result: T;
  statusCode: string;
  resultCode: string;
  msg: string;
}

/** 后端业务错误码，与 TexhubError 中的邀请相关分支对应。 */
export const INVITE_ERR = {
  INVALID: "0040010017",
  NOT_OWNER: "0040010018",
  CHECK_FAILED: "0040010019",
} as const;

/**
 * 统一拆包：把 HTTP 200 里的 resultCode 业务错误转成 reject。
 *
 * 项目的后端约定是「所有响应都是 HTTP 200，错误看 resultCode」，所以 axios
 * 永远不会 reject；不显式判断 resultCode 的话，业务错误会被当成成功数据
 * 继续往下走，UI 上表现为"点了没反应"或渲染出 undefined。
 */
function unwrap<T>(resp: ApiResponse<T> | undefined): Promise<T> {
  if (!resp) {
    return Promise.reject(new Error("network error"));
  }
  if (resp.resultCode !== "200") {
    return Promise.reject(new Error(resp.msg || "request failed"));
  }
  return Promise.resolve(resp.result);
}

/**
 * 签发（或复用）项目邀请链接。仅 Owner 可调用。
 *
 * 后端在已有有效凭证时会返回同一条，因此重复点"生成"不会作废已发出的链接。
 * expireDays / maxUses 仅在首次签发时生效；传 0 或不传表示永久 / 不限次。
 */
export function createInvite(
  projectId: string,
  expireDays?: number,
  maxUses?: number
): Promise<InviteToken> {
  const config: AxiosRequestConfig = {
    method: "post",
    url: "/tex/share/invite",
    data: JSON.stringify({
      project_id: projectId,
      expire_days: expireDays ?? 0,
      max_uses: maxUses ?? 0,
    }),
  };
  return XHRClient.requestWithoutAction(config).then(unwrap<InviteToken>);
}

/**
 * 读取项目当前的邀请凭证，不签发。仅 Owner 可调用。
 *
 * 与 createInvite 分开是刻意的：打开分享弹窗是只读动作，不该顺带把一条
 * 凭证签发出来。没有可用凭证（从未生成 / 已撤销 / 已过期）时返回 null。
 */
export function getInvite(projectId: string): Promise<InviteToken | null> {
  const config: AxiosRequestConfig = {
    method: "get",
    url: "/tex/share/invite",
    params: { project_id: projectId },
  };
  return XHRClient.requestWithoutAction(config).then(unwrap<InviteToken | null>);
}

/**
 * 撤销项目当前的邀请链接。仅 Owner 可调用，幂等。
 * 撤销后此前分发的链接立即失效。
 */
export function revokeInvite(projectId: string): Promise<string> {
  const config: AxiosRequestConfig = {
    method: "post",
    url: "/tex/share/invite/revoke",
    data: JSON.stringify({ project_id: projectId }),
  };
  return XHRClient.requestWithoutAction(config).then(unwrap<string>);
}

/**
 * 预览邀请链接背后的项目信息。只需登录，不需要已是成员。
 * 链接无效 / 已撤销 / 已过期时 reject。
 */
export function previewInvite(token: string): Promise<InvitePreview> {
  const config: AxiosRequestConfig = {
    method: "get",
    url: "/tex/share/invite/preview",
    params: { token },
  };
  return XHRClient.requestWithoutAction(config).then(unwrap<InvitePreview>);
}
