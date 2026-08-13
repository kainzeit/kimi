# 迁移调研记录

## Vercel

- 官方文档显示，Vercel Cron Jobs 可通过 `vercel.json` 或 Build Output API 配置，并调用生产部署上的 Vercel Functions。
- 对本项目而言，现有的每日回收站清理需要改造成受环境变量密钥保护的函数端点，并以 Vercel 使用的 5 字段 Cron 表达式配置。
- 来源：<https://vercel.com/docs/cron-jobs>

## Netlify

- 官方文档显示，Netlify Scheduled Functions 使用 UTC 时区的 cron 表达式，可在 TypeScript/JavaScript 函数代码中或 `netlify.toml` 中声明。
- 对本项目而言，现有每日回收站清理应改写为 Netlify Scheduled Function，并从新的数据库环境变量中建立连接。
- 来源：<https://docs.netlify.com/build/functions/scheduled-functions/>

## 运行时配置迁移

Vercel 的环境变量按项目与部署环境配置，变量更新只对后续部署生效。因此迁移时应在目标项目中重新创建所有服务端密钥与前端公开配置，并重新部署验证。来源：<https://vercel.com/docs/environment-variables>

Netlify 的环境变量可供 Functions、Scheduled Functions 与 Background Functions 使用；要让运行时函数访问变量，需要通过 Netlify 的环境变量管理界面、CLI 或 API 设置，并赋予 Functions 可用范围。来源：<https://docs.netlify.com/build/functions/environment-variables/>
