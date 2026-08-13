# kimi. 迁移备份清单

> **用途：** 本文档用于在**不改变当前网站**的前提下，建立可恢复、可迁移的备份。它不执行删除、DNS 修改、数据库迁移或部署操作。文档基于 2026-08-13 的项目盘点编写；实际迁移前应重新运行一次资产核对。

## 1. 先做的结论

当前 `kimi.` 不是纯静态网站，而是由 React/Vite 前端、Express/tRPC 后端、MySQL 数据库、富文本图片存储、Manus 登录和每日定时清理共同组成。仅下载代码或仅部署前端，都不足以恢复 Manage、文章发布、图片上传、回收站、登录和 15 天自动清理。

如果 Manus 官方通知确认账户受数据服务变更影响，应先使用官方的 **Task Data Backup**。该备份包含代码、上传文件、数据库、配置、密钥和集成设置；单独下载代码并不能替代它。[1] 本文其余步骤则是独立于平台的第二层备份，用于未来迁到其他托管服务。

| 备份层 | 目的 | 建议频率 | 是否会改动现站 |
|---|---|---:|---|
| 官方任务数据备份 | 完整保留当前托管项目及其数据库、文件和设置 | 如官方通知要求；每次重大改动后重新导出 | 否 |
| GitHub 代码副本 | 保存可审阅、可回滚的源代码和历史 | 每次功能检查点后 | 否 |
| 数据库导出 | 独立保留内容、设置和运营记录 | 每月一次及迁移前 | 否 |
| 图片与附件归档 | 防止富文本和页面图片链接失效 | 每月一次及迁移前 | 否 |
| 环境变量登记册 | 记录“变量用途”和替换方案，不记录明文秘密 | 每次新增集成后 | 否 |

## 2. 当前项目资产盘点

当前代码已连接 GitHub，主分支为 `main`。代码使用 React 19、Vite、Tailwind、Tiptap 富文本编辑器、Express、tRPC、Drizzle ORM 和 MySQL；生产构建目前同时输出浏览器静态资源和 Node 服务端入口。因此，目标平台需要同时承接静态前端与服务端函数/接口。

截至本次盘点，数据库中有 **29** 篇文章（其中 **1** 篇在 Article Recycle Bin）、**4** 条页面内容、**12** 个页面图片、**3** 条站点配置、**40** 条文章浏览统计、**159** 条访问记录及 **1** 个用户记录。计数用于迁移验收，不应被视为备份本身。

| 资产 | 现有位置 | 必须导出 | 迁移后的用途与注意事项 |
|---|---|---|---|
| 源代码与锁定依赖 | GitHub `main`、项目 ZIP | `client/`、`server/`、`drizzle/`、`shared/`、`scripts/`、`package.json`、锁文件、配置文件、测试 | 在新平台创建独立仓库/部署项目；不要把 `.env` 或真实密钥提交到 Git。 |
| 文章 | `articles` 表 | 全表 SQL/CSV；另按栏目导出 Markdown | 保留 `slug`、`content`、`category`、`publishedAt`、草稿/隐藏/回收站状态。正文含图片时须同步迁移图片地址。 |
| 私有自动保存 | `articleAutosaves` 表 | 全表 SQL/CSV | 当前计数为 0；仍应包含在完整导出中，以防未来有未发布工作副本。 |
| Foyer/Knock 等页面内容 | `pageContent` 表 | 全表 SQL/CSV 或单独 HTML/Markdown 文件 | 保留 `pageKey` 与富文本 HTML。 |
| 页面图片元数据 | `images` 表 | 全表 SQL/CSV | 保留 `fileKey`、`url`、`pageKey`、`displayWidth`、`displayHeight` 与删除状态。 |
| 原始图片对象 | 当前对象存储，页面以 `/manus-storage/<key>` 引用 | 每个 `images.fileKey` 对应对象；另扫描富文本 HTML 内所有 `/manus-storage/` 图片链接 | 先下载原文件，再上传到新存储；最后批量更新数据库字段与 HTML 中的 `src`。 |
| 站点设置 | `siteConfig` 表 | 全表 SQL/CSV，单独加密保存 | 包含问候页配置和定时任务标识等。若含访问口令，不应公开共享。 |
| 用户与权限 | `users` 表 | 最小化导出；通常仅迁移站点所有者所需信息 | Manus `openId` 不能直接当作新登录系统的身份。需在新身份提供商中重新建立管理员账号并映射角色。 |
| 运营数据 | `articleViews`、`accessLogs` 表 | 可选 SQL/CSV | 浏览量可保留；访问日志含 IP/设备信息，是否迁移应按隐私与保留需求决定。 |
| 每日清理任务 | 已启用的 `recycle-retention-cleanup` | 记录任务用途、频率、回调路径和 15 天规则 | 在目标平台重建；不要复制 Manus 专用任务标识或鉴权方式。 |
| 域名与 DNS | 当前 Manus 子域名及可能的自有域名设置 | 域名注册商、DNS 区域、证书/验证记录清单 | 自有域名可在迁移切换时改 DNS；`manus.space` 子域名不能迁到外部平台。 |

## 3. 非破坏性备份操作清单

### 3.1 代码与构建副本

先确认 GitHub 的 `main` 已包含最新检查点。然后下载一个项目 ZIP 作为离线副本，并记录当前版本号、导出日期、Node.js 版本与 `pnpm-lock.yaml`。GitHub 副本应保留完整提交历史；ZIP 仅作为无法访问 GitHub 时的冗余副本。

- [ ] 在 GitHub 确认 `main` 已推送到最新版本。
- [ ] 下载项目 ZIP，并以 `kimi-code-YYYY-MM-DD.zip` 命名。
- [ ] 将 ZIP 保存到至少两个独立位置，例如本地加密硬盘与个人云盘。
- [ ] 不将真实环境变量写入代码、README 或 Git 提交记录。

### 3.2 数据库内容导出

完整数据库导出应优先采用与 MySQL 兼容的 SQL dump；CSV 适合作为便于人工检查的附加副本。迁移验收时，应核对文章、页面内容、图片记录和回收站计数是否与本表第 2 节一致。SQL 导出必须保留表结构、索引、唯一约束、日期字段和布尔状态。

| 优先级 | 表 | 是否建议迁移 | 原因 |
|---|---|---|---|
| 必须 | `articles`、`pageContent`、`images`、`siteConfig` | 是 | 构成网站内容、展示与核心行为。 |
| 建议 | `articleAutosaves`、`articleViews` | 是 | 保留私有工作副本和阅读统计。 |
| 视情况 | `users` | 最小化迁移 | 新认证系统通常需要重新创建身份，不应盲目复用旧 OAuth 标识。 |
| 可选 | `accessLogs` | 取决于隐私策略 | 含访问记录，通常不影响网站恢复。 |

- [ ] 导出完整 MySQL 模式和全部数据为 SQL 文件。
- [ ] 另导出上述“必须”表为 UTF-8 CSV，方便抽样查看。
- [ ] 抽样检查 A Whim、Imagination、Elsewhere 的富文本 HTML、草稿、隐藏状态和回收站时间。
- [ ] 将 SQL/CSV 置于加密存储；不要公开其中的登录、访问日志或站点设置内容。

### 3.3 图片与富文本内嵌媒体归档

当前图片上传会存入对象存储，并由 `/manus-storage/<key>` 路径在页面和富文本 HTML 中引用。迁移时最大的风险不是 `images` 表丢失，而是文章 HTML 中的图片仍指向旧路径。因此必须同时备份**原始对象**和**引用关系**。

- [ ] 从 `images` 表导出 `fileKey`、`url`、尺寸与所属页面信息。
- [ ] 扫描 `articles.content` 与 `pageContent.content` 中的 `/manus-storage/` 链接，建立“内容记录 → 图片文件”的清单。
- [ ] 下载每个唯一图片对象的原始文件，并以其 `fileKey` 或稳定文件名归档。
- [ ] 对每个文件计算 SHA-256 校验值，确保下载无误。
- [ ] 迁移后上传图片到新对象存储，再批量替换 `images.url` 和富文本 HTML 内的 `src` 地址。

## 4. 环境变量与秘密的迁移登记册

环境变量的**名称与用途**可写入迁移登记册，但绝不能在这份文档、GitHub、截图或聊天中记录真实值。Vercel 以项目/环境管理变量，并要求重新部署后新值才会生效；Netlify 也要求通过其环境变量管理机制将运行时变量提供给 Functions。[2] [3]

| 当前变量或类别 | 当前用途 | 外部迁移时的处理 |
|---|---|---|
| `DATABASE_URL` | MySQL/Drizzle 连接 | 在目标托管数据库创建新的连接字符串；保留 MySQL 可减少数据层改动。 |
| `JWT_SECRET` | 当前会话签名 | 在目标平台生成全新强随机值；不要复制旧值。 |
| `VITE_APP_ID`、`OAUTH_SERVER_URL`、`VITE_OAUTH_PORTAL_URL` | Manus OAuth 登录 | 必须替换为新的身份方案，例如 Auth.js、Clerk、Supabase Auth 或自建登录。 |
| `OWNER_OPEN_ID`、`OWNER_NAME` | Manus 所有者识别 | 改为目标身份系统的管理员记录或受保护的邮箱/用户 ID。 |
| `BUILT_IN_FORGE_API_URL`、`BUILT_IN_FORGE_API_KEY` | Manus 对象存储/平台 API | 移除并替换为 S3 兼容存储、Cloudinary 或 Supabase Storage 的服务端密钥。 |
| `VITE_FRONTEND_FORGE_API_URL`、`VITE_FRONTEND_FORGE_API_KEY` | 前端 Manus 平台访问 | 需移除或以新后端 API 重写；避免向浏览器暴露存储管理权限。 |
| `VITE_ANALYTICS_ENDPOINT`、`VITE_ANALYTICS_WEBSITE_ID` | 当前分析脚本 | 可重新接入任意分析服务，或暂时关闭。 |
| `VITE_APP_TITLE`、`VITE_APP_LOGO` | 站点元数据 | 作为普通构建变量或静态配置保留。 |
| `NODE_ENV`、`PORT` | Node 运行环境 | 由目标平台运行时提供或在构建设置中配置。 |
| 未来的调度密钥 | 保护每日清理端点 | 在 Vercel/Netlify 中单独设置；不使用现有 Manus 计划任务令牌。 |

## 5. 必须替换的 Manus 专用模块

当前 React 页面、Tailwind、Tiptap、Drizzle 模式和大部分文章业务逻辑可以保留；以下部分与 Manus 托管能力绑定，迁移时必须替换或重构。

| 当前模块 | 当前实现 | Vercel 迁移方向 | Netlify 迁移方向 | 验收标准 |
|---|---|---|---|---|
| 后端入口 | 单个 Express 服务入口 `server/_core/index.ts` | 拆分为 `/api/*` Functions，或改用支持 Vite/Node 的框架路由 | 拆分为 `netlify/functions/*` | `/api/trpc`、上传、文章管理和公开读取均可工作。 |
| tRPC API | Express adapter 下的 `/api/trpc` | 以 Function/框架 API Route 承载 tRPC adapter | 以 Netlify Function 承载 tRPC adapter | Manage 读取、发布、草稿、隐藏、回收站均通过。 |
| 登录 | Manus OAuth 与所有者 `openId` | 用新的身份提供商与会话方案替换 | 用新的身份提供商与会话方案替换 | 未登录者无法进入 Manage；所有者可登录并管理内容。 |
| 数据库 | Manus 注入的 MySQL 连接 | 连接到外部 MySQL；保留 Drizzle/MySQL 可最小改动 | 同左 | 迁移后数据行数、富文本和状态完整。 |
| 图片存储 | Forge 预签名上传与 `/manus-storage/` 代理 | 改为目标对象存储 SDK 与公开/签名 URL | 同左 | 新上传、旧图片、正文图片缩放均正常。 |
| 每日清理 | Manus 项目级计划任务，回调 `/api/scheduled/recycle-cleanup` | 改为 Vercel Cron；官方文档说明 Cron 可通过配置调用生产部署上的 Functions。[4] | 改为 Scheduled Function；它按 UTC cron 运行，可在函数代码或 `netlify.toml` 中声明。[5] | 仅回收站满 15 天的文章被删除，调用有鉴权且可重复执行。 |
| 域名与 DNS | Manus 域名绑定 | 在 Vercel 添加自有域名并更新 DNS | 在 Netlify 添加自有域名并更新 DNS | HTTPS 正常、主域名与必要子域名均指向新站。 |
| Manus 内置能力 | 平台存储、登录、计划任务及相关环境变量 | 移除依赖或替换为第三方服务 | 移除依赖或替换为第三方服务 | 代码中不再依赖 `BUILT_IN_FORGE_*`、Manus OAuth 或 Manus 调度身份。 |

## 6. 两条未来迁移路线

Vercel 和 Netlify 都能承接静态 React 前端、函数和环境变量，但都不替代数据库或文件对象存储。对这个项目而言，最稳妥的做法是先保持 MySQL 与 Drizzle，再只替换托管入口、认证、存储和定时任务；一次性改数据库类型会明显增加风险。

| 路线 | 最适合的情况 | 需要重点改造 | 每日清理的目标实现 |
|---|---|---|---|
| Vercel 路线 | 希望将 API 以独立函数部署，并以 `vercel.json` 管理计划任务 | Express 单入口拆分、tRPC Function adapter、认证和存储 | 每日 `0 3 * * *`（UTC）的 Cron 调用受密钥保护的 Function。Vercel Cron 使用 5 字段表达式并调用生产 URL。[4] |
| Netlify 路线 | 希望将前端和 Serverless Functions 统一配置在 `netlify.toml` | Express 单入口拆分、tRPC Netlify Function adapter、认证和存储 | 每日 `0 3 * * *`（UTC）的 Scheduled Function；函数可在代码或 `netlify.toml` 声明计划。[5] |

## 7. 建议的迁移顺序

迁移不应在没有可恢复备份的情况下直接切换 DNS。先在独立的测试环境恢复数据库和图片，使用一个临时地址验证公开网站和 Manage；全部通过后再切换自有域名。默认 `manus.space` 地址不可带到外部平台，因此应优先使用您可控制的自有域名作为长期入口。

1. **建立备份。** 完成第 3 节的代码、数据库、图片与变量登记册，并验证文件能打开。
2. **建立测试环境。** 在目标数据库导入 SQL；上传图片到新存储；运行数据库迁移或兼容性检查。
3. **迁移后端。** 先重建公开文章读取、Manage、登录、富文本图片上传与回收站；再迁移浏览统计与访问日志。
4. **重建每日任务。** 以 UTC 03:00 配置目标平台计划函数，使用新的服务端密钥验证调用，保留“已删除满 15 天才可永久删除”的条件。
5. **验收。** 用真实但非敏感测试文章验证发布、草稿、隐藏、恢复、批量永久删除、图片插入/显示、移动端布局和自动清理的资格判断。
6. **切换域名。** 降低 DNS TTL、更新 DNS、验证 HTTPS、首页、各文章 slug、旧链接重定向和管理登录。
7. **保留回滚窗口。** 在至少一个 DNS TTL 周期内保留当前站点和完整备份；未完成验收前不关闭原服务。

## 8. 迁移前最终验收表

| 检查项 | 成功标准 | 完成 |
|---|---|---|
| 代码 | 新仓库可从锁文件安装、测试和构建 | [ ] |
| 数据库 | 关键表行数与迁移前盘点一致；内容抽样无乱码 | [ ] |
| 图片 | 页面图片和正文图片全部可加载；无旧 `/manus-storage/` 失效链接 | [ ] |
| 登录 | 仅授权管理员可访问 Manage | [ ] |
| 内容工作流 | 新建、草稿、发布、隐藏、恢复、Markdown 导出均可用 | [ ] |
| 回收站 | 全选、批量永久删除、15 天资格判断正确 | [ ] |
| 定时任务 | 每日任务有日志、重试安全、不会删除未到期条目 | [ ] |
| 域名 | HTTPS、根域名、文章链接、移动端与桌面端均通过 | [ ] |
| 回滚 | 旧站、数据库备份和图片归档在切换期内仍可恢复 | [ ] |

## 参考资料

[1]: https://help.manus.im/en/articles/16147892-service-change-overview-how-to-back-up-your-data "Manus — How to Back Up Your Data"
[2]: https://vercel.com/docs/environment-variables "Vercel — Environment Variables"
[3]: https://docs.netlify.com/build/functions/environment-variables/ "Netlify — Environment Variables and Serverless Functions"
[4]: https://vercel.com/docs/cron-jobs "Vercel — Cron Jobs"
[5]: https://docs.netlify.com/build/functions/scheduled-functions/ "Netlify — Scheduled Functions"
