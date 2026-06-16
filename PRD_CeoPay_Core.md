# 新收单系统 (CeoPay) - 核心模块详细功能规格文档

## 1. 模块总览
*   **业务目标**：提供一个稳定、安全的多渠道聚合收单与运营管理中台。核心解决多支付通道 (Stripe, Airwallex, Citcon, Zelle) 的生命周期管理、风控预警（EFW/Disputes）、订单履约流转、资金结算（余额/提现）、退款操作，并深度结合 AB 站跳转技术实现支付伪装与防风控，同时支持基于 RBAC 的子用户数据隔离。
*   **系统功能全景图**：
    *   **📊 数据概览 (Dashboard)**：提供多维度的交易大盘、成功率统计、国家/通道分布图表。
    *   **📝 订单管理 (Orders)**：千万级订单的高级检索，支持真实资金原路退款、底层支付日志 (Charges) 穿透查询及风控雷达分析。
    *   **💳 多通道账号管理 (Gateways)**：
        *   **Stripe 账号**：配置 PK/SK、查询实时余额与发起提现、监控早期欺诈预警 (EFW) 和拒付争议 (Disputes)。
        *   **Airwallex / Citcon / Zelle 账号**：多渠道接入支持，提供各自独立的密钥绑定与限额熔断管理。
    *   **⚙️ 配置管理 (Configurations)**：
        *   **账号分组 (PayGroup)**：将收单账号打包分组，供独立站按组轮询收款。
        *   **白名单管理 (Whitelists)**：严格控制各个账号允许交易的国家代码。
    *   **🛡️ 风控与运维 (Risk & Ops)**：
        *   **黑名单 (Blacklist)**：基于邮箱、IP、卡号的全局拦截机制。
        *   **转点管理 (Country Transfer)**：按不同国家的当地时间午夜，自动化重置对应 Stripe 账号的可用单量，防止单量超载。
        *   **日志管理 (Logs)**：记录所有用户的资金敏感操作和系统调用轨迹。
    *   **👥 用户管理 (Users)**：多级代理商/商户体系，不同层级间的数据严格物理隔离。
    *   **🌐 B站管理 (B-Site Ecosystem)**：产品分类、B站正规产品库维护（用于交易伪装替换）、建站域名管理。
    *   **📧 邮件管理 (Email System)**：集成 SMTP 配置，支持自定义发信模板，并自动建立订单确认/营销邮件任务列队。
*   **版本说明**：V1.0.0

### 3.4 用户与权限管理 (Users & RBAC)

**业务场景与核心价值**：
这是整套系统的“多租户（Multi-tenant）”基石。系统往往由一个总庄家（Super Admin）搭建，下发账号给多个代理商，代理商再往下发展独立站商户。商户之间互为竞争对手，数据必须处于绝对的“物理黑盒”状态，绝不能发生“商户 A 看到商户 B 的订单流水或客户邮箱”的严重事故。

| 功能编号 | 所属页面 | 功能名称 | 前置操作条件 | 详细操作步骤 | 正常业务流程 | 异常场景&报错提示 | 输入字段明细 | 返回数据&页面展示规则 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| UR-001 | 用户管理 | 用户增删改查 | 具有 Admin 权限 | 1. 列表查看；2. 新增/编辑用户 | 操作 xgs_yonghu 表。角色分为：超级管理员(1)、代理商(4)、商户(5)。 | 用户名重复拦截。 | username, password, juese_id, tgid(飞机ID), pid(父级ID) | 密码使用 AES-256-ECB 和随机 salt 加密。 |
| UR-002 | 数据隔离 | RBAC 权限隔离 | 用户登录后访问各模块 | 系统自动在底层 SQL 注入查询限制 | 代理商(4)和商户(5)只能查看 pid 为自身或子账号的数据，包括订单、网关账号、日志等。 | 无权限则返回空列表。 | Token 解析出的 user_id | 确保商户之间数据绝对物理隔离。 |

### 3.5 B站生态管理 (B-Site Ecosystem)

**业务场景与核心价值**：
专门为了解决“特货/侵权商品无法直接通过 Stripe 官方风控审查”的行业痛点而生。A站是商户真实卖特货的网站，B站是商户搭建的一个专门卖“正规百货（如 T-shirt、水杯）”的伪装网站。系统通过 A-B 站的跳转和数据替换，让 Stripe 的风控爬虫和审核人员永远只能看到 B 站的正规商品交易，从而保住收款账号的存活。

| 功能编号 | 所属页面 | 功能名称 | 前置操作条件 | 详细操作步骤 | 正常业务流程 | 异常场景&报错提示 | 输入字段明细 | 返回数据&页面展示规则 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BS-001 | 站点管理 | A/B 站点维护 | 进入 WebsiteView | 1. 录入站点域名；2. 绑定归属商户 | 在 xgs_website 表记录商户的 A/B 站 URL。**核心用途**：防止外部非法流量直接调用网关接口（必须匹配白名单域名）；同时为支付完成后的重定向提供准确的回调地址。 | 无 | domain_name, url, website_system | 列表展示站点及审核状态。 |
| BS-002 | 产品库管理 | 伪装产品录入 | 进入 ProductView | 1. 创建分类；2. 录入正规商品 | 在 xgs_account_product_name 表录入正规商品（如 T-shirt）。**核心用途**：当 A 站进来一笔 100 美元的“假鞋”订单时，系统会在这里自动挑选 5 件 20 美元的 T-shirt，组装成新的账单发给 Stripe 扣款。 | 金额格式错误拦截。 | product_name, sku, unit_price, url | 提供商品库，防风控核心组件。 |

### 3.6 风控与安全运维 (Risk & Ops)

**业务场景与核心价值**：
保护商户的“收单账号资产”免受攻击和内部人为事故的破坏。对外：防御恶意买家（职业“退款客”、盗刷黑卡团伙）故意制造的高危拒付率导致 Stripe 封号。对内：约束运营人员的行为，对所有敏感操作（查余额、手动点击真实退款）进行不可篡改的流水账本记录，方便事后追责溯源。

| 功能编号 | 所属页面 | 功能名称 | 前置操作条件 | 详细操作步骤 | 正常业务流程 | 异常场景&报错提示 | 输入字段明细 | 返回数据&页面展示规则 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| RO-001 | 黑名单管理 | 全局防刷拦截 | 进入 BlacklistView | 1. 录入恶意买家特征 | 将恶意用户的 IP、Email、Phone 或 Name 录入 xgs_heimingdan 表。前端进单接口一旦匹配命中，直接拒绝交易，并返回系统忙碌等迷惑性提示。 | 无 | ip, email, phone, name | 全局拦截生效。 |
| RO-002 | 系统日志 | 操作轨迹审计 | 进入 LogsView | 1. 筛选操作行为 | 读取 xgs_tlog 表。系统所有敏感操作（如查余额、提现、修改配置）均会静默记录操作人、路由、IP 和 UA。这是解决“谁动了我的钱和配置”终极答案的铁证。 | 无 | search (模糊匹配) | 以时间线或表格展示，供溯源定责。 |

### 3.7 邮件与营销系统 (Email System)

**业务场景与核心价值**：
提升客户信任感与复购率，同时降低退款率的“软性维稳”手段。买家在 A 站付款后，如果迟迟收不到订单确认信或物流单号，极易引发恐慌并去银行发起拒付（Chargeback）。此模块能自动化下发带有正规品牌落款的安抚邮件。其**深层反侦察机制**在于，发信过程全面挂载海外代理 IP，防止发信服务器 IP 暴露真实网关物理位置，避免被安全机构“一锅端”。

| 功能编号 | 所属页面 | 功能名称 | 前置操作条件 | 详细操作步骤 | 正常业务流程 | 异常场景&报错提示 | 输入字段明细 | 返回数据&页面展示规则 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| EM-001 | SMTP池 | 发信邮箱配置 | 进入 SmtpServerView | 1. 录入 SMTP 凭证 | 在 xgs_smtp_pool 表配置企业邮箱。**核心亮点**：系统在发信时，会通过 xgs_proxy_pool 绑定的海外代理 IP 发送邮件，防止发信 IP 被识别追踪。 | 连接超时或凭证错误报错。 | host, port, username, password | 代理发信防追踪。 |
| EM-002 | 邮件模板 | 动态变量模板 | 进入 EmailTemplate | 1. 设置邮件内容 | 在 xgs_email_type 和 xgs_email_template 表中定义支持富文本与动态变量的邮件内容。当后端触发动作时组装真实数据。 | 模板名重复拦截。 | type_name, template, order_variable | 支持变量替换如 {order_no}。 |
| EM-003 | 邮件发送底层链路 | 自动化邮件投递 | 订单状态变更或主动触发 | 后端调用 fasongyoujian 方法 | 1. 系统根据 lxtime (最后发送时间) 轮询出一个当前空闲且 status=1 的 SMTP 账号。；2. 通过 LEFT JOIN proxy_pool 查出其绑定的代理服务器。；3. PHPMailer 设置 SMTPOptions 通过该代理发起 TCP 连接。；4. 投递成功后更新 lxtime 供下一次轮询使用。 | 代理超时：捕获异常并返回 False。 | to, subject, body | 实现分布式隐身发信。 |
| EM-004 | 邮件外发 API | CeoMail 接口 | 后端业务需要外部发送 | 后端调用 sendMailCeo | 如果不想使用本地代理发送，系统还支持对接专门的外部发信 API (如 hsmail.vip)，只需 POST 接收人与正文即可完成下发。 | 无 | ToEmailUser, subject, content | 减轻本地服务器发信负担。 |

---

## 2. 全局公共规则
*   **权限控制 (RBAC)**：
    *   `Super Admin`：拥有最高操作权限，包括但不限于**真实退款 (`yhtuikuan`)**、**提现 (`create_a_payout`)**、全局数据查看。
    *   `Admin` / `CS`：受限操作，无法进行资金出账类操作；订单及账号数据受限于绑定的 `PayGroup`（支付分组）。
*   **数据状态枚举**：
    *   **订单状态 (`status`)**：`1` (成功), `2` (待处理), `6` (失败)。
    *   **Stripe 账号状态**：`active` (激活), `inactive` (暂停), `suspended` (挂起)。
    *   **提现状态**：`paid` (已支付), `pending` (处理中), `failed` (失败), `canceled` (已取消)。
*   **分页与搜索**：
    *   列表默认分页 `per_page = 10`。
    *   采用前端缓存机制（IndexedDB）记忆用户的筛选条件与分页进度。
*   **统一样式规范**：
    *   所有列表/表单/弹窗必须自适应 Mobile/Tablet/PC 三端。
    *   所有 UI 组件必须支持 Dark/Light 双主题切换。
    *   货币金额处理：必须经过 `isZeroDecimalCurrency` 校验，零小数货币（如 JPY）直接展示/传输，常规货币（如 USD）前端展示时除以 100，传输时乘以 100 转为最小单位。

---

## 3. 详细功能点规格表

### 3.1 Stripe 账号管理模块

**业务场景与核心价值**：
这是整套系统的“造血中枢”。对于特货/敏感商品卖家而言，单个 Stripe 账号极其容易被风控封禁。因此，商户需要同时维护几十甚至上百个 Stripe 账号。本模块的核心场景是“无缝切换与集中管控”：商户在网关配置好所有账号后，只需将它们打包成一个 PayGroup（分组）。当 A 站进单时，系统会在分组内自动轮询，一旦某个账号当日收款额度达到上限或被 Stripe 封禁，系统会自动将流量切给下一个存活的账号，保证业务永不宕机。

| 功能编号 | 所属页面 | 功能名称 | 前置操作条件 | 详细操作步骤 | 正常业务流程 | 异常场景&报错提示 | 输入字段明细 | 返回数据&页面展示规则 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ST-001 | Stripe 管理 | 获取余额 | 点击列表操作栏的“余额”图标 | 1. 点击余额按钮；2. 系统发起查询；3. 弹窗展示数据 | 调用 /get_retrieve_balance 成功，弹窗分类展示各币种金额。 | 网络异常/密钥失效："获取余额失败"。 | 无 | 弹窗结构化展示 available, pending, instant_available 等，非零金额展示“提现”按钮。 |
| ST-002 | Stripe 管理 | 发起提现 | 余额弹窗中，点击特定币种的“提现”按钮 | 1. 点击提现；2. 弹出提现表单；3. 输入金额；4. 点击确认提现 | 调用 /create_a_payout 成功，关闭弹窗，Toast 提示成功。 | 金额为空/非正数："请输入提现金额"；超出最大可用："提现金额不能大于可用余额"；接口失败："提现失败" | amount (Number/必填/无/校验: >0 且 <= 最大可用余额) | 按钮进入 Loading 态 (Spinner)。 |
| ST-003 | Stripe 管理 | 查看提现记录 | (仅 Super Admin) 点击列表操作栏“提现记录”图标 | 1. 点击图标；2. 弹出提现记录 Modal | 调用 /get_list_all_payouts，成功则在表格/卡片中展示历史。 | 接口请求失败：Toast 提示网络异常。 | 自动携带分页 starting_after 参数 | 列表展示 ID, 金额, 状态(彩色Label), 预计到账日期, 创建时间。触底加载更多。 |
| ST-004 | Stripe 管理 | 账号高级检索 | 进入 Stripe 账号列表页 | 1. 展开筛选条件；2. 填写字段；3. 点击搜索 | 调用 /getStripeList 并带入过滤条件。 | 无数据展示空状态。 | comment (String/支付通道), userId (Int/所属子账号), paymentType (Enum/通道类型), status (Enum/激活状态) | 刷新列表。 |
| ST-005 | Stripe 管理 | 新增/编辑账号 | 点击“新增账号”或列表的“编辑”图标 | 1. 唤起表单 Modal；2. 填写账号基本信息、API密钥、风控限额等；3. 保存 | 调用 /setStripe，成功后刷新列表。 | 必填项为空：表单验证标红拦截。；保存失败：Toast 提示错误信息。 | pk (String/必填), sk (String/必填), max_purchase (Number/选填), whitelist (String/选填/需为大写字母逗号分隔) | 关闭 Modal，列表重新加载当前页。 |
| ST-006 | Stripe 管理 | 早期欺诈预警 (EFW) 查看 | 列表点击“预警”图标 | 1. 点击图标唤起 Modal | 调用 /getEarlyFraudWarnings 查询当前账号的 EFW 记录。 | 未获取到则展示为空。 | id (Stripe 账号 ID) | 渲染表格展示 EFW 列表数据（包含交易金额、预警原因、创建时间）。 |
| ST-007 | Stripe 管理 | 账户争议 (Dispute) 查看 | 列表点击“争议”图标 | 1. 点击图标唤起 Modal | 调用 /getDisputelist 查询当前账号的 Disputes 记录。 | 未获取到则展示为空。 | id (Stripe 账号 ID) | 渲染表格展示 Dispute 列表数据（包含争议状态、争议原因、举证截止日期）。 |
| ST-008 | Stripe 管理 | 预警标记流转与争议查看 | 从预警/争议列表中操作 | 1. 浏览 EFW/Dispute 明细；2. 点击对应单号，可直接定位/关联到订单系统查看全链路信息 | 将 Stripe 原生安全日志与自有业务订单打通。 | 网络异常：Toast 提示。 | 预警/争议单号 (ID) | 展示对应的风控明细详情。 |

### 3.2 订单交易管理模块

**业务场景与核心价值**：
这是商户日常高频使用的“收银台流水账本”。由于采用了 A-B 站伪装架构，商户在 A 站（如 Shopify 卖鞋）后台看到的订单是残缺的（看不到底层信用卡的报错）。因此，商户需要在这个网关中台查阅完整的资金履约情况：确认哪笔订单被风控拦截、查询拒付雷达评分、甚至是发现某笔高危订单后，手动在此处点击“原路退款”以规避未来的拒付（Chargeback）罚单。

| 功能编号 | 所属页面 | 功能名称 | 前置操作条件 | 详细操作步骤 | 正常业务流程 | 异常场景&报错提示 | 输入字段明细 | 返回数据&页面展示规则 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 功能编号 | 所属页面 | 功能名称 | 前置操作条件 | 详细操作步骤 | 正常业务流程 | 异常场景&报错提示 | 输入字段明细 | 返回数据&页面展示规则 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| OD-001 | 订单列表 | 订单高级检索 | 进入订单页面 | 1. 展开高级筛选面板；2. 填写筛选条件；3. 点击查询 | 调用 /getOdersList，带入复杂参数过滤。 | 无数据："暂无数据"。 | query (模糊查询/String), status (Enum), firstName, lastName, userId, orderNo, startTime/endTime (时间戳), email, country, comment (支付通道), shippingStatus (发货状态), url (站点) | 刷新表格数据，重置页码至 1。 |
| OD-002 | 订单列表 | 真实退款 | 订单状态为成功(1) 且 当前为 Super Admin | 1. 点击操作菜单的“退款”按钮；2. 确认二次弹窗；3. 提交请求 | 调用 /yhtuikuan 发起真实退款，成功后更新状态。 | 权限不足：隐藏按钮。；接口返回非 1："退款失败 [msg]"。 | orderNo (String/隐藏透传) | Toast 提示“退款成功”，列表刷新，对应订单状态变更。 |
| OD-003 | 订单列表 | 状态标记流转 | 具备 Admin/Super Admin 权限 | 1. 点击操作菜单中的“5天退款/120天/已退款”；2. 确认二次弹窗 | 仅在系统内部流转状态，不发起真实资金操作。 | 网络异常："操作失败"。 | orderNo (String/隐藏透传), 目标状态枚举值 | Toast 提示成功，列表对应数据更新状态标签。 |
| OD-004 | 订单详情 | 风险雷达查询 | 订单状态为成功或待处理 | 1. 点击订单操作栏“雷达”图标 | 调用 /getRisklevel，获取该订单在通道侧的风控画像。 | 接口异常或未查到风控数据：返回默认空状态。 | orderNo (String) | 弹窗展示雷达图及具体风险得分指标。 |
| OD-005 | 订单详情 | 订单明细查看 | 从列表点击某条订单 | 1. 点击进入详情页；2. 加载 /getOrder 和 /getListallcharges | 渲染联系人、交易流水、技术指标(IP/UA等)及底部多次支付扣款记录。 | 无数据："暂无数据"。 | id (String/订单内部ID) | 详细渲染 order 结构。解析 order.data 提取 title（页面标题）和 ad（广告来源）展示。 |
| OD-006 | 订单详情 | 系统操作日志查询 | 订单详情页最下方 | 1. 滑动至底部 Logs 模块；2. 点击某条 Log 的“View” | 解析 order.logList 数据，展示该订单下产生的操作轨迹（关联的用户、IP、动作）。 | 无 | 无 | 以卡片/表格展示日志记录。 |

### 3.3 转点时间管理 (Country Transfer Point)

**业务场景与核心价值**：
解决跨国业务中“账号单量超载与浪费”的矛盾。例如：商户设置一个 Stripe 账号每天只能收 3 单。如果不做转点管理，这 3 单如果按照中国时间（北京时间凌晨 0 点刷新）重置，那么在美国的销售高峰期（北京时间白天），账号可能早就没额度了。有了转点管理，系统会自动在“美国时间的午夜”去重置额度，让账号的收款能力完美匹配目标市场的作息规律，最大化榨取账号价值且不触发异常作息风控。

| 功能编号 | 所属页面 | 功能名称 | 前置操作条件 | 详细操作步骤 | 正常业务流程 | 异常场景&报错提示 | 输入字段明细 | 返回数据&页面展示规则 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CT-001 | 运营配置 | 转点时间配置 | 具有 Admin 权限 | 1. 进入转点管理页；2. 点击新增/编辑；3. 选择国家与时间 | 设定某个国家当地时间的午夜（或指定时间）为“转点（过零点）”基准线。 | 已存在该国家的配置："Country codes already exist"。 | country_code (Enum/国家缩写), time_country (Time/HH:MM:SS) | 列表展示国家图标、重置时间与最后更新时间。 |
| CT-002 | 后台定时任务 | 自动重置单量 | 无 (由宝塔/Crontab 触发) | 1. 定时任务调用网关后端的 /chongzhijishu 接口 | 扫描配置表，当服务器北京时间到达某个国家设定的 time_country 时，**将该国家下的所有 Stripe 账号的可用单量 (max_order) 重置为预设的基数 (jishu)**，并重新激活因超限被暂停的账号 (status=1)。 | 无 | 无 | 触发后通过 Telegram 机器人推送消息至管理员/商户群组，播报各商户名下被重置后恢复的可用单量。 |

---

## 4. 数据库核心表设计 (基于真实 SQL 物理表结构)

### 表名：`xgs_stripe` (收单账号配置表)
用于存储和管理多通道（Stripe、Airwallex、Zelle等）的API密钥、限额配置以及风控防刷指标。

| 字段名 | 数据类型 | 长度 | 是否必填 | 枚举/默认值 | 业务备注 |
| --- | --- | --- | --- | --- | --- |
| id | int | 11 | 是 | AUTO_INCREMENT | 主键 |
| status | int | 11 | 是 | 0 | 0:暂停, 1:激活, 2:完成, 3:挂起, 4:删除 |
| group_id | int | 11 | 否 | - | 分组ID (关联 xgs_stripe_group) |
| comment | varchar | 268 | 否 | - | 账号名称/注册邮箱 |
| api_key | varchar | 268 | 否 | - | Stripe Webhook Secret / 备用密钥 |
| api_publishable_key | varchar | 268 | 否 | - | Stripe PK (公钥) |
| endpoint_secret | varchar | 268 | 否 | - | Stripe SK (私钥) |
| c_site_url | varchar | 268 | 否 | - | B站/代理站链接 (定位到支付代码文件夹层) |
| max_money | decimal | 18,2 | 否 | - | 账号允许收款的最大金额限额 |
| max_order | int | 11 | 否 | - | 账号允许收款的最大订单量限额 |
| money_sum | decimal | 18,2 | 否 | 0.00 | 当前已收总金额 |
| order_count | int | 11 | 否 | 0 | 当前已收总单量 |
| level | int | 11 | 否 | - | 账号调度优先级 |
| description | varchar | 688 | 否 | - | 账号描述 (供内部备注) |
| maximum_purchase_amount | decimal | 18,2 | 否 | - | 单笔购买上限金额 |
| minimum_purchase_amount | decimal | 18,2 | 否 | 1.00 | 单笔购买下限金额 |
| createtime | bigint | 20 | 否 | - | 创建时间戳 |
| updatetime | bigint | 20 | 否 | - | 修改时间戳 |
| lunxun_status | int | 11 | 否 | 0 | 轮询计数器 (用于组内接单分配) |
| user_id | int | 11 | 否 | - | 关联的商户/代理商ID |
| type | int | 11 | 是 | 1 | 通道类型：0:钓鱼, 1:Stripe, 2:空云, 3:Zelle 等 |
| jishu | int | 11 | 否 | 0 | 自动重置单量的基数 |
| zhuandianId | int | 11 | 否 | 1 | 绑定的国家转点时间表ID |
| frequency | varchar | 268 | 否 | 'day' | 订阅周期模式 (规避风控用) |
| interval_count | int | 11 | 是 | 7 | 订阅计数 (如配合day为每7天收费) |
| jihuo | int | 11 | 是 | 0 | 是否需要人工二次激活 (针对系统自动挂起) |
| bankAccountHolder | varchar | 268 | 否 | - | 绑定的提现银行账户持有人 |

### 表名：`xgs_order` (业务订单流转表)
记录系统从 A 站接收到的所有交易流水、客户隐私信息、风控雷达信息及物流状态。

| 字段名 | 数据类型 | 长度 | 是否必填 | 枚举/默认值 | 业务备注 |
| --- | --- | --- | --- | --- | --- |
| id | int | 11 | 是 | AUTO_INCREMENT | 主键 |
| url | varchar | 268 | 否 | - | A站(来源独立站)网站域名 |
| orderNo | varchar | 268 | 否 | - | 系统生成的全局唯一订单编号 |
| client_orderNo | varchar | 268 | 否 | - | 客户独立站(A站)的原始订单编号 |
| user_id | int | 11 | 否 | - | 所属商户ID |
| title | varchar | 268 | 否 | - | A站真实的商品名称 |
| amount | decimal | 18,2 | 否 | - | 交易金额 |
| currency | varchar | 268 | 否 | - | 交易币种 (如 USD, EUR, JPY) |
| type_aisle | varchar | 268 | 否 | - | 实际支付扣款的账号ID (关联 xgs_stripe.id) |
| status | int | 11 | 否 | 0 | 0:未支付, 1:成功, 2:测试成功, 6:失败, 9:退款, 120:120天出款等 |
| success_url | varchar | 668 | 否 | - | 支付成功后前端重定向地址 |
| notify_url | varchar | 268 | 否 | - | 异步回调A站的Webhook地址 |
| first_name / last_name | varchar | 268 | 否 | - | 客户名 / 客户姓 |
| email | varchar | 268 | 否 | - | 客户邮箱 |
| phone | varchar | 268 | 否 | - | 客户手机号 |
| address / city / state | varchar | 268 | 否 | - | 客户账单地址 / 城市 / 州省 |
| zipcode / country_code | varchar | 268 | 否 | - | 邮政编码 / ISO国家代码 (如 US, GB) |
| ip / ipv6 | varchar | 268 | 否 | - | 客户下单公网IP |
| user_agent | varchar | 668 | 否 | - | 客户浏览器指纹(User-Agent) |
| risk_level / risk_score | varchar | 268 | 否 | - | 通道侧(Stripe Radar)返回的欺诈等级与评分 |
| failure_code | varchar | 268 | 否 | - | 支付失败错误码 (如 card_declined) |
| failure_message | varchar | 268 | 否 | - | 支付失败详细原因 |
| data | text | - | 否 | - | 提交进来的原始加密JSON数据(包含AB站跳板信息) |
| tracking_number | varchar | 268 | 否 | - | 履约物流单号 |
| shipping_status | varchar | 268 | 否 | '未发货' | 当前物流状态 |
| paymentType | int | 11 | 否 | 0 | 支付表单模式 (0:内嵌, 1:跳转) |
| createtime | bigint | 20 | 否 | - | 进单时间戳 |
| updatetime | bigint | 20 | 否 | - | 最后状态更新时间戳 |

---

## 5. RESTful 接口深度解析与内部实现流转

本章节详细剖析了系统几个最核心的 API 接口在网关后端（`www.pay.ceo`）的具体执行逻辑。特别是与 Stripe 官方交互时的“B站跳板加密转发”机制。

### 5.1 获取 Stripe 账户余额 (`get_retrieve_balance`)
*   **接口地址**：`/index.php/api/Stripe/get_retrieve_balance`
*   **请求参数**：`id` (Stripe账号的主键ID)
*   **后端执行逻辑与 Stripe 交互**：
    1. **提取密钥**：后端根据 `id` 查出 `xgs_stripe` 表中的 `endpoint_secret`（即 Stripe 的 SK）。
    2. **组装载荷**：构建一个包含 SK 的数组，并使用系统统一的 AES 加密算法（固定密钥 `123456789`）将其转为密文 `data`。
    3. **跳板请求**：后端提取该账号配置的 `c_site_url`（如 `https://www.comallm.xyz/okxd/chaxun.php`），将加密的 `data` 拼在 URL 后面发起 GET 请求。
    4. **B站代理层**：B站收到请求后解密出 SK，**由B站服务器代替网关服务器向 Stripe 发起 `GET https://api.stripe.com/v1/balance`**。
    5. **网关处理返回**：网关收到 B站返回的 Stripe 官方 JSON 后，解析出 `available` (可用余额) 和 `pending` (待结算)，原样组装返回给前端。

### 5.2 发起 Stripe 提现 (`create_a_payout`)
*   **接口地址**：`/index.php/api/Stripe/create_a_payout`
*   **请求参数**：`id` (账号ID), `amount` (金额), `currency` (币种)
*   **后端执行逻辑与 Stripe 交互**：
    1. **金额换算**：Stripe 要求提交的金额必须是最小单位。后端会判断如果不是零小数货币（如 JPY），则会自动将 `amount * 100`。
    2. **组装载荷**：将换算后的 `amount`、`currency` 以及账号的 SK 打包成数组，并进行 AES 加密。
    3. **跳板请求**：向 B站的 `chaxun.php` 接口发送请求。并带上特定的参数标识这是一个 Payout 操作。
    4. **B站代理层**：B站解密后，向 Stripe 发起 `POST https://api.stripe.com/v1/payouts`。
    5. **网关处理返回**：若 Stripe 返回 `status => 'pending'`，代表发起成功。网关此时还会调用 `$this->log->setLog` 在 `xgs_tlog` 表中记录一条“发起提现”的操作审计日志。

### 5.3 真实资金退款 (`yhtuikuan`)
*   **接口地址**：`/index.php/Api/Order/yhtuikuan`
*   **请求参数**：`orderNo` (业务订单号)
*   **后端执行逻辑与 Stripe 交互**：
    1. **定位凭证**：通过 `orderNo` 查询 `xgs_order` 表，找出负责这笔订单的 Stripe 账号ID (`type_aisle`) 和底层支付凭证 (`payment_intent_id` 或 `charge_id`)。如果是订阅模式产生的订单，提取逻辑会更复杂，需要从 `custompayment_intent_id` 中剥离出真实的 ID。
    2. **组装载荷**：将退款目标的 `payment_intent_id` 和对应账号的 SK 打包并 AES 加密。
    3. **跳板请求**：通过 B站的代理接口转发。
    4. **B站代理层**：向 Stripe 发起 `POST https://api.stripe.com/v1/refunds`。
    5. **网关处理返回**：如果 Stripe 返回成功，网关后端会将 `xgs_order` 表中该订单的 `status` 强制更新为 `9` (已退款)，并记录操作日志。

### 5.4 订单底层扣款明细穿透 (`getListallcharges`)
*   **接口地址**：`/index.php/Api/Order/getListallcharges`
*   **请求参数**：`id` (订单ID)
*   **后端执行逻辑与 Stripe 交互**：
    1. **提取通道**：查出该订单归属的 Stripe 账号。
    2. **跳板请求**：将订单底层的 `payment_intent` 和账号 SK 加密后，推送到 B站专门用于查询流水的代理接口 `yhchaxun.php`。
    3. **B站代理层**：向 Stripe 发起 `GET https://api.stripe.com/v1/charges?payment_intent={id}`。
    4. **网关处理返回**：Stripe 会返回该笔订单在银行卡网络最底层的风控指纹（如 `cvc_check`, `address_zip_check` 的比对结果），网关直接透传给前端用于风控复盘。

### 5.5 早期欺诈预警 (EFW) 与争议 (Disputes) 获取
*   **接口地址**：`/index.php/Api/Stripe/getEarlyFraudWarnings` & `/getDisputelist`
*   **请求参数**：`id` (账号ID)
*   **后端执行逻辑与 Stripe 交互**：
    1. **安全校验**：与提现逻辑类似，均采用 AES 加密并通过 B站跳板发送请求。
    2. **B站代理层**：
        *   预警：请求 `GET https://api.stripe.com/v1/radar/early_fraud_warnings`
        *   争议：请求 `GET https://api.stripe.com/v1/disputes`
    3. **网关处理返回**：网关不对 Stripe 返回的风控列表做数据库持久化存储，而是每次前端点击时实时拉取并展示。这是为了保证风控状态（如从“预警”升级为“拒付”）的绝对时效性。

### 5.6 A站进单枢纽分配 (`get_url` - 最核心的防风控路由)
*   **接口地址**：`/index.php/api/Order/get_url` (或同类名称的进单接口)
*   **请求参数**：来自 A站的商品金额、客户信息、收货地址等 JSON 载荷。
*   **后端执行逻辑**：
    1. **反欺诈阻断**：先去 `xgs_heimingdan` (黑名单表) 校验买家的 IP 和邮箱。若命中直接返回失败。
    2. **智能寻址**：根据商户传来的 `pay_group` ID，去 `xgs_stripe` 里面寻找一个 `status=1` (激活) 且今日单量 (`order_count`) 和金额 (`money_sum`) 均未超过 `max_order` 和 `max_money` 的账号。
    3. **商品伪装提取**：去 `xgs_account_product_name` 库中，随机抽取与订单金额最接近的“正规商品（如T-shirt）”。
    4. **加密与重定向**：将买家信息和挑选出的正规商品打包，用 AES 加密成一段长文本 `data`。拼接出 B站收银台的 URL（如 `https://www.comallm.xyz/okxd/pay.php?orderNo=xxx&data=加密串`），返回给 A站，指令 A站前端执行 `window.location.href` 跳转。

---





## 6. 核心交易链路详细分析 (基于代码实现)

### 6.1 整体架构与“双重物理隔离”说明
新收单系统在交易链路上采用了 **A站 (独立站/商户) -> 网关后端 (www.pay.ceo) -> B站 (www.comallm.xyz 收银台) -> Stripe 官方** 的多跳与隔离架构。
这套架构的核心目的只有一个：**绝对不暴露 A站（卖特货的域名）和支付网关服务器（核心资产数据库）**。

#### 物理隔离的底层实现原理：
1.  **A 站隐身**：Stripe 官方永远只和 B 站（正规百货网站）的域名交互。不论是 Checkout Session 跳转还是 Webhook 回调，Stripe 看到的 URL 都是 `www.comallm.xyz`。
2.  **网关服务器隐身**：网关服务器（`www.pay.ceo`）**绝对不主动向 Stripe 发起任何 HTTP 请求**。所有与 Stripe 的通信（查余额、创单、退款）均由网关把指令用 AES 加密发给 B站，由 B站的服务器去请求 Stripe。这就避免了网关服务器 IP 因为集中处理上千个 Stripe 账号而被 Stripe 风控直接关联并一窝端。

### 6.2 进单与加密跳板逻辑 (网关后端 `Order.php`)
该流程对应网关后端的 `get_url` 接口，是“A站数据洗白”的核心枢纽。

**核心代码级逻辑剖析**：
1. **获取跳板参数**：系统通过 `xgs_stripe` 表匹配到健康的收款账号后，会抽取该账号绑定的 `c_site_url`（即 B站 URL）和 `account_product_name`（即 B站伪装的正规 T恤）。
2. **AES 组装加密**：
   ```php
   // 提取 B站的商品名和商户传来的真实客户邮箱、地址
   $sendData = [
       'amount' => $amount,
       'productName' => $fake_product_name, 
       'email' => $buyer_email,
       'stripe_sk' => $secret_key // Stripe的私钥也打包给B站
   ];
   // 使用 AES-128-ECB 进行强加密，固定密钥
   $encryptData = $this->encryptData(json_encode($sendData), '123456789');
   ```
3. **返回跳转指令**：网关将加密串返回给 A站，A站前端直接执行：
   `window.location.href = "https://www.comallm.xyz/okxd/pay.php?orderNo=xxx&data=" + encryptData;`
   *此时，交易场景正式从 A站转移到了 B站。*

### 6.3 B站收银台的多样化支付策略与极度混淆机制
在 B 站 (`www.comallm.xyz/okxd` 目录) 中，系统并未单一依赖某一种支付 API，而是**并行实现了 5 套不同的 Stripe 支付链路**，并辅以极高强度的代码级混淆，来彻底打乱风控爬虫的特征识别。

#### 6.3.1 入口混淆与流量打散
*   **代码级表现**：该目录下存在如 `AkriWdnIEjHBfxbOhb.php`, `AfnrSpYbrTXTM.php` 等几十个毫无语义的 PHP 脚本。
*   **混淆逻辑**：B 站的主入口 `pay.php` 接收到 A 站的跳转后，**绝不自己处理**。它会执行一个 `$random_script = $scripts[array_rand($scripts)];` 的逻辑，把用户用 `header('Location: ...')` 随机丢到这几十个乱码脚本中的一个去执行结账。这让 Stripe 的风控探针无法通过抓取固定的结账 URL 特征（如 `/checkout`）来判断异常。

#### 6.3.2 订阅模式 (Subscriptions) 的代码级变种对抗
对于高危行业，普通的实物 Checkout 极易触发 3D 验证（3D Secure）。系统大量采用了“订阅模式（Subscription）”来欺骗 Stripe 这是一个“虚拟会员”服务。

**代码级对抗细节**：
在 `PaymentMethod.php` 中，为了防止 Stripe 发现“所有账单都是按天订阅的 9.9 美元”，系统在向 Stripe 提交 `v1/prices` 创建订阅价格时，强制植入了周期随机化：
```php
// 随机抽取订阅周期，极度迷惑风控
$cycles = ['day', 'week', 'month'];
$random_interval = $cycles[array_rand($cycles)];

$price_payload = [
    'unit_amount' => $amount_in_cents,
    'currency' => 'usd',
    'recurring' => [
        'interval' => $random_interval, // 一会儿是按周，一会儿是按月
        'interval_count' => rand(1, 14) // 周期时长也是随机的
    ],
    'product_data' => ['name' => 'Premium Membership']
];
// 发送给 Stripe 创建 Price
```
随后系统利用 `payment_behavior => 'default_incomplete'` 创建订阅，拿到首单扣款授权 `client_secret`。用户付款后，立刻在后台调用 `v1/subscriptions/{id}` 将其取消（Cancel），**从而实现“借订阅之名，行单次扣款之实”的降维打击。**

#### 6.3.3 同一支付模式下的代码级混淆与变种实现

系统在 B 站最极致的防御策略在于：**即使是调用同一个 Stripe API，也通过截然不同的代码书写方式、不同的底层 HTTP 客户端来实现，从而彻底破坏风控爬虫的静态代码特征匹配。** 以下是 `/okxd` 目录下不同文件的核心混淆代码片段分析：

**变种一：Checkout Session 的原生 cURL 与 SDK 混淆**
在 `AfnrSpYbrTXTM.php` 中，系统抛弃了 Stripe 的官方 SDK，手写了一个底层的 `send_st_post` 方法，自己组装 Header：
```php
// /www.comallm.xyz/okxd/AfnrSpYbrTXTM.php
$checkout_session_data = array(
    'line_items' => [[
        'price_data' => [
            'currency' => $currency,
            'product_data' => ['name' => $title],
            'unit_amount' => $je,
        ],
        'quantity' => 1,
    ]],
    'mode' => 'payment',
    // 变种路径A
    'success_url' => $_SERVER['REQUEST_SCHEME']."://".$_SERVER['HTTP_HOST'].'/fimur/yhveedOmPzhYH.php?state=1&order='.$orderNo,
);
// 纯原生 cURL 调用，规避 SDK 特征
$checkout_session = send_st_post("https://api.stripe.com/v1/checkout/sessions", $checkout_session_data, $skey, 'POST');
```

而在 `aJwIw.php` 中，系统又切换回了官方 PHP SDK 对象化调用，使用不同的回调路径：
```php
// /www.comallm.xyz/okxd/aJwIw.php
$stripe = new \Stripe\StripeClient($skey);
$checkout_session = $stripe->checkout->sessions->create([
    // ... 商品组装逻辑 ...
    'mode' => 'payment',
    // 变种路径B
    'success_url' => $_SERVER['REQUEST_SCHEME']."://".$_SERVER['HTTP_HOST'].'/gate/GpFiR.php?state=1&order='.$orderNo,
]);
```

另外在 `oFIViQzSWhATWfyGT.php` 中，对于同样的 Checkout Session，并没有直接重定向，而是将官方 URL 组装成 JSON 返回给前端（适应 SPA 单页应用的拦截与跳转）：
```php
// /www.comallm.xyz/okxd/oFIViQzSWhATWfyGT.php
// 不使用 header("Location: ...")，而是返回 JSON 供前端跨域获取
$fh = [
    'Location' => $checkout_session->url,
];
echo json_encode($fh);
```

**变种二：Payment Links 动态生成模式**
在 `AkriWdnIEjHBfxbOhb.php` 中，系统完全绕开了常规的 Session 或 Intent，采用动态生成 Stripe 官方 Payment Link 的模式。前端用户会被直接踢到 Stripe 官方托管的支付页面，极大增加支付链接的权威性。
```php
// /www.comallm.xyz/okxd/AkriWdnIEjHBfxbOhb.php
$paymentlink_data = array(
    'line_items' => [
        [
            'price_data' => [
                'currency' => $currency,
                'unit_amount' => $je, 
                'product_data' => ['name' => $title],
            ],
            'quantity' => 1,
        ],
    ],
    'after_completion' => [
        'type' => 'redirect',
        'redirect' => [ // 跳转回混淆路径
            'url' => $_SERVER['REQUEST_SCHEME']."://".$_SERVER['HTTP_HOST'].'/tour/nGkbCSZYYPdmdSjdpG.php?state=1&order='.$orderNo,
        ],
    ],
);
// 动态创建官方支付链接
$paymentlink = send_st_post("https://api.stripe.com/v1/payment_links", $paymentlink_data, $skey, 'POST');
header("Location: ".$paymentlink->url); // 直接 302 重定向到 Stripe 官方域
```

**变种三：Payment Intents 的双向伪装逻辑**
在 `paymentIntents.php` 中，系统为了让风控看起来像一个极其合规的独立站买家，**强制在调用 Intent 前，先生成带完整收货地址的 Customer 画像**：
```php
// /www.comallm.xyz/okxd/paymentIntents.php
$customersdata = array(
    'email' => $email,
    'name' => $name,
    'shipping' => [
        'address' => [
            'city' => $city,
            'country' => $country,
            'line1' => $line1,
            'postal_code' => $postal_code,
        ],
        'name' => $name,
    ],
    // 故意增加 tax.ip_address 指纹，提升真实度
    'tax'=>['ip_address'=>$ip] 
);
// 1. 先用原生方法查库创建客户
$customers = send_st_post("https://api.stripe.com/v1/customers", $customersdata, $skey);

// 2. 将客户ID绑入 Intent
$paymentIntentsdata = array(
    'customer' => $customers->id,
    'amount'=>$je,
    'currency'=>$curcrency,
    'automatic_payment_methods'=>['enabled'=>'true']
);
$paymentIntents = send_st_post("https://api.stripe.com/v1/payment_intents", $paymentIntentsdata, $skey);
```

**变种四：Setup Intents 延后离线扣款 (逃避 3D 验证)**
普通的 Intent 会在前端立刻拉起 3D Secure 弹窗（如果触发风控），但在 `create_setup_intent.php` 中，系统利用了 `off_session` 机制：
```php
// /www.comallm.xyz/okxd/create_setup_intent.php
$setupIntentdata = array(
    'customer' => $customer_id,
    'payment_method_types' => ['card'],
    'usage' => 'off_session', // 核心参数：标记为脱机使用
);
// 这只要求买家授权绑卡，不立刻发起金额扣除
$setupIntent = send_st("https://api.stripe.com/v1/setup_intents", $setupIntentdata, $skey, 'POST');
```

**变种五：强制金额随机化与离线订阅扣款**
在 `cjdingyue.php` 与 `create_subscription.php` 中，系统为了打破“相同金额连续进单”的风控模型，**直接在 B 站代码层面随机篡改扣款金额**（与 A 站真实订单金额脱钩），然后将其伪装成订阅周期的离线意图：
```php
// /www.comallm.xyz/okxd/cjdingyue.php
// 针对不同币种，直接生成一个随机的扣款浮点数，完全打散资金模型
if($curcrency=="usd"){
    $min = 8.9;
    $max = 19.9;
    $amount = number_format($min + (rand() / getrandmax()) * ($max - $min), 2);
    $jine=bcmul($amount,100);
}
// 强制保存支付方式为默认
$customerdata = ['invoice_settings' => ['default_payment_method' => $payment_method]];
send_st("https://api.stripe.com/v1/customers/".$customer_id, $customerdata, $skey, 'POST');

// 强制生成一个“虚拟周期”的 Price
$pricesddata = array(
    'product_data'=> ['name'=>$product_name],
    'unit_amount' =>$jine, // 随机化后的金额
    'currency' => $curcrency,
    'recurring' => ['interval' => $frequency], // frequency 默认为 day
);
$pricesd = send_st("https://api.stripe.com/v1/prices", $pricesddata, $skey, 'POST');

// 使用离线模式 (off_session=true) 直接确认意图，规避实时风控拦截
$PaymentIntentdata = array(
    'amount' =>$jine,
    'customer' => $customer_id,
    'payment_method' => $payment_method,
    'off_session' => 'true', // 脱机扣款
    'confirm' => 'true',     // 立即确认
);
$PaymentIntent = send_st('https://api.stripe.com/v1/payment_intents', $PaymentIntentdata, $skey, 'POST');
```

**混淆的核心价值总结**：
这种**“殊途同归”**的编码方式，使得 B 站的每一个结账入口在物理文件大小、变量命名、调用栈深度、发起 TCP 连接的底层组件（cURL vs 官方 SDK）、甚至**金额模型（固定金额 vs 随机金额）**上都呈现出巨大的差异化。当 Stripe 的安全团队试图通过分析某一个被举报的收款页面（比如寻找特定的回调路径 `/gate/GpFiR.php` 或特定的金额分布特征）来批量封杀其他页面时，这种代码级和业务级的物理差异能有效地将其阻断。

### 6.4 数据回传闭环（B站通知网关与A站）
当用户在 Stripe 付款成功后，如何安全地通知隐身的网关和 A站？
*   **Stripe -> B站**：Stripe 官方的 Webhook 推送给 B 站的 `notify.php`。
*   **B站 -> 网关**：`notify.php` 根据内存（Redis）里存的映射关系找到 `orderNo`，通过 Curl 向网关（`www.pay.ceo/api/Index/stsuccess`）发送支付成功指令。
*   **网关 -> A站**：网关接收到成功指令后，执行限额扣减，最后向 A站原始订单的 `notify_url` 推送 POST 请求，A站后台订单变为已支付。整个链路闭环，A站与网关完美隐身。