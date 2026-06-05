# LLW Rhythm 小程序

给 LLW 自用的微信小程序，用来记录排便、饮食、饮水和纤维摄入，并接入小米 MiMo Token Plan API 生成饮食建议。

## 功能

- 概览：最近排便、7 天次数、14 天 Bristol 形态、日均饮水和纤维。
- 记录排便：时间、Bristol 类型、顺畅度、用时、费力/疼痛/腹胀/未尽感、备注。
- 记录饮食：餐次、食物、饮水、纤维估算、蔬果/咖啡因/乳制品/辛辣/油炸标签。
- 记录列表：查看和删除排便/饮食记录。
- AI 建议：调用 OpenAI 兼容的 `/chat/completions` 接口，基于最近 21 天记录输出中文建议。
- 数据备份：复制备份 JSON、从剪贴板导入。备份不会包含 API Key。
- Apple 风格 UI：浅色 grouped background、大标题、圆角卡片、固定高度按钮和 iOS 式列表。

## 使用方式

1. 打开微信开发者工具。
2. 选择“导入项目”，项目目录选择本仓库。
3. 当前 `project.config.json` 使用 `touristappid`，本地调试可以先用游客模式；正式发布时替换成自己的小程序 AppID。
4. 在“设置”页填写 API Key。API 地址和模型已默认适配小米 Token Plan。

## 小程序开发者权限

微信开发者工具提示“登录用户不是该小程序的开发者”通常是 AppID 和当前登录微信号不匹配导致的。

- 本仓库默认使用 `touristappid`，只能本地调试，不能正式上传发布。
- 如果换成真实小程序 AppID，需要在微信公众平台的小程序后台把当前登录的微信号加入“成员管理/项目成员”，角色选“开发者”。
- 需要扫码体验时，也可以把微信号加入“体验成员”。
- 加完成员后，重新打开微信开发者工具并导入项目，再执行预览或上传。

## AI 接口说明

默认 Token Plan 配置：

- API 地址：`https://token-plan-cn.xiaomimimo.com/v1`
- 默认模型：`mimo-v2.5`
- API Key：在小米 Token Plan 页面复制，通常以 `tp-` 开头

代码里预留了 `utils/storage.js` 的 `DEFAULT_AI_API_KEY`。本地调试时可以临时填入完整 Key，让设置页默认带上；公开仓库或正式提交前不要把真实 Key 提交上去，否则别人可以直接使用你的额度。

接口按 OpenAI 兼容格式请求：

```http
POST {API地址}/chat/completions
Authorization: Bearer {API Key}
Content-Type: application/json
```

如果 API 地址已经以 `/chat/completions` 结尾，小程序会直接使用完整地址。

正式发布微信小程序时，需要把 `token-plan-cn.xiaomimimo.com` 配置到微信小程序后台的 request 合法域名。开发阶段可以在微信开发者工具里关闭域名校验。

## 隐私

所有排便、饮食记录和 API Key 都保存在当前微信小程序本地 storage。代码里没有硬编码 Key，导出的备份 JSON 也会清空 Key。

## 健康边界

小程序只做记录和生活方式建议，不替代医生。若出现便血、持续腹痛、呕吐、发热、体重明显下降，或自我调整后仍长期便秘，应优先咨询医生。
