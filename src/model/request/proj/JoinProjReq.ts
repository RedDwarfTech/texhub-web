/**
 * 加入项目的请求体。
 *
 * 只带 token，不再带 project_id：加入哪个项目由服务端从 token 反查决定。
 * 之前前端会同时传 project_id，而那个值完全可由客户端伪造，等于任何登录
 * 用户只要知道项目 ID 就能自助入伙。
 */
export interface JoinProjReq {
  token: string;
}
