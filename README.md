# 🎬 Cinema Archive Vault | 电影档案室

一个具有**电影档案美学**风格的电影展示与可视化网站。包含按片单年份的可视化图表、支持搜索、筛选和排序的电影列表。数据来源于豆瓣豆列。

## 📋 项目概览

| 项目 | 说明 |
|------|------|
| **数据规模** | 1,950 部唯一电影，3,293 条记录 |
| **数据来源** | 豆瓣 7 个豆列（2019-2025 年） |
| **海报数量** | 1,949 张本地下载的海报 |
| **类型数量** | 35 种电影类型 |
| **技术栈** | 纯 HTML + CSS + JavaScript（无框架） |
| **设计风格** | 电影档案美学（深黑 + 金色 + 银色） |

## 🚀 快速开始

### 1. 启动本地服务器

```bash
# 进入项目目录
cd cinema-archive-vault-simple

# 启动 Python 内置服务器（推荐）
python -m http.server 8000

# 或使用 Node.js http-server
npx http-server -p 8000

# 或使用 PHP
php -S localhost:8000
```

### 2. 访问网站

打开浏览器访问：`http://localhost:8000`

### 3. 清除浏览器缓存

使用 **Ctrl+Shift+R**（Windows/Linux）或 **Cmd+Shift+R**（Mac）进行强制刷新，确保加载最新版本。

## 📁 项目结构

```
cinema-archive-vault-simple/
├── README.md                    # 项目文档（本文件）
├── index.html                   # 主 HTML 文件
├── styles.css                   # 样式表（现代设计系统）
├── app.js                        # 核心 JavaScript 逻辑
├── data/
│   ├── movies_with_stats.json   # 主数据文件（1,950 部电影 + 统计数据）
│   ├── movies_unique.json       # 去重后的电影数据
│   └── yearly_stats.json        # 按年份的统计数据
├── posters/                     # 电影海报目录（1,949 张 WebP 格式）
│   ├── [douban_id].webp
│   ├── [douban_id].webp
│   └── ...
└── scripts/                     # 数据处理脚本（可选）
    ├── scrape_douban.py         # 豆瓣爬虫脚本
    └── download_posters.py      # 海报下载脚本
```

## 🎨 设计风格

### 色彩系统

| 颜色 | 十六进制 | 用途 |
|------|---------|------|
| 深黑 | `#0a0e27` | 背景色 |
| 金色 | `#d4af37` | 强调色、标题 |
| 银色 | `#c0c0c0` | 次要强调、边框 |
| 深灰 | `#1a1f3a` | 卡片背景 |
| 浅灰 | `#e0e0e0` | 文本颜色 |

### 设计元素

- **页头**：渐变背景 + 发光效果
- **卡片**：深色背景 + 阴影 + 悬停效果
- **图表**：10 种彩色渐变
- **排版**：优雅的字体层级

## 📊 功能说明

### 1. 数据可视化仪表板

**位置**：首页 → "仪表板" 标签页

**功能**：
- 📈 按年份切换统计数据
- 🎯 显示国家、类型、导演分布
- 🎨 多种图表类型（柱状图、条形图等）
- 📊 交互式图表（悬停显示数据）

**使用方法**：
1. 点击年份按钮切换数据
2. 图表自动更新
3. 悬停图表查看详细数据

### 2. 电影列表页面

**位置**：首页 → "电影列表" 标签页

**功能**：
- 🔍 **搜索**：按电影名称、导演、演员搜索
- 🏷️ **按类型筛选**：选择一个或多个类型
- 📅 **按年份筛选**：选择电影上映年份
- 🔤 **排序**：按名称、年份、评分排序
- 📄 **分页**：每页显示 30 部电影

**使用方法**：
1. 在搜索框输入关键词
2. 点击"筛选"按钮打开筛选面板
3. 选择类型和年份
4. 选择排序方式
5. 使用分页按钮浏览

### 3. 电影详情

**显示内容**：
- 🖼️ 电影海报
- 📝 电影名称
- ⭐ 豆瓣评分
- 👥 导演和演员
- 📅 上映年份
- 🎬 类型标签

## 🔧 开发指南

### 修改样式

编辑 `styles.css` 文件：

```css
/* 修改颜色 */
:root {
  --color-primary: #d4af37;      /* 金色 */
  --color-secondary: #c0c0c0;    /* 银色 */
  --color-background: #0a0e27;   /* 深黑 */
}

/* 修改卡片样式 */
.movie-card {
  background: var(--color-card);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
```

### 修改数据

编辑 `data/movies_with_stats.json` 文件：

```json
{
  "movies": [
    {
      "id": "1",
      "name": "电影名称",
      "director": "导演名称",
      "actors": "演员1,演员2",
      "year": 2023,
      "genres": ["剧情", "爱情"],
      "rating": 8.5,
      "poster": "posters/1.webp",
      "douban_url": "https://movie.douban.com/subject/1/"
    }
  ],
  "stats": {
    "2023": {
      "countries": {...},
      "genres": {...},
      "directors": {...}
    }
  }
}
```

### 添加新电影

1. 更新 `data/movies_with_stats.json`
2. 将海报文件放入 `posters/` 目录
3. 刷新浏览器查看效果

### 更新数据爬虫

使用提供的 Python 脚本重新爬取数据：

```bash
# 爬取豆瓣数据
python scripts/scrape_douban.py

# 下载电影海报
python scripts/download_posters.py

# 处理数据（可选）
python scripts/process_data.py
```

## 📈 数据处理流程

### 1. 数据爬取（scrape_douban.py）

```python
# 爬取 7 个豆列
# 输出：raw_movies.json（3,293 条记录）
```

**豆列信息**：
- 豆列 1：[豆列 ID]
- 豆列 2：[豆列 ID]
- ...
- 豆列 7：[豆列 ID]

### 2. 海报下载（download_posters.py）

```python
# 下载所有电影海报
# 使用 Referer 头绕过防盗链
# 输出：posters/[douban_id].webp（1,949 张）
```

**关键参数**：
- `Referer: https://movie.douban.com/`
- 格式：WebP（高效压缩）
- 分辨率：原始尺寸

### 3. 数据处理

**去重**：按豆瓣 URL 去重 → 1,950 部唯一电影

**类型分解**：
- 多类型电影（如"剧情/历史"）分解为单个类型
- 每个类型单独计数
- 结果：35 种类型

**统计生成**：
- 按年份统计国家、类型、导演分布
- 生成 `yearly_stats.json`

## 🐛 常见问题

### Q1: 海报无法加载？

**解决方案**：
1. 确保 `posters/` 目录存在
2. 检查海报文件名是否正确
3. 使用 **Ctrl+Shift+R** 强制刷新浏览器
4. 检查浏览器控制台（F12）的错误信息

### Q2: 搜索结果为空？

**解决方案**：
1. 检查搜索关键词拼写
2. 尝试使用部分关键词
3. 清除筛选条件
4. 刷新页面重新加载数据

### Q3: 图表无法显示？

**解决方案**：
1. 检查 `data/movies_with_stats.json` 文件是否存在
2. 验证 JSON 格式是否正确
3. 打开浏览器控制台查看错误信息
4. 尝试重新下载数据文件

### Q4: 性能问题（加载缓慢）？

**解决方案**：
1. 减少每页显示的电影数量（修改 `app.js` 中的 `MOVIES_PER_PAGE`）
2. 启用浏览器缓存
3. 使用更快的网络连接
4. 检查浏览器是否加载了太多标签页

## 🔐 数据隐私

- ✅ 所有数据本地存储，不上传到服务器
- ✅ 海报本地下载，不依赖外部链接
- ✅ 无用户追踪或分析
- ✅ 完全离线可用

## 📝 许可证

本项目数据来源于豆瓣，仅供学习和研究使用。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 贡献方式

1. Fork 本项目
2. 创建特性分支（`git checkout -b feature/AmazingFeature`）
3. 提交更改（`git commit -m 'Add some AmazingFeature'`）
4. 推送到分支（`git push origin feature/AmazingFeature`）
5. 开启 Pull Request

## 📞 联系方式

如有问题或建议，欢迎通过以下方式联系：

- 📧 Email：[your-email@example.com]
- 💬 GitHub Issues：[项目 Issues 页面]
- 🐦 Twitter：[@your-twitter]

## 🎯 后续开发计划

### 短期计划（1-2 周）

- [ ] 添加电影详情模态框
- [ ] 实现收藏功能
- [ ] 优化移动端响应式设计
- [ ] 添加深色/浅色主题切换

### 中期计划（1-2 月）

- [ ] 集成豆瓣 API 实时数据
- [ ] 添加用户评论功能
- [ ] 实现高级搜索和推荐算法
- [ ] 支持数据导出（CSV、JSON）

### 长期计划（3-6 月）

- [ ] 多语言支持（英文、日文等）
- [ ] 社交分享功能
- [ ] 用户账户系统
- [ ] 移动应用（React Native）
- [ ] 后端 API 服务

## 📊 项目统计

| 指标 | 数值 |
|------|------|
| 总电影数 | 1,950 |
| 总记录数 | 3,293 |
| 唯一海报 | 1,949 |
| 电影类型 | 35 |
| 数据年份 | 2019-2025 |
| 总数据大小 | ~86 MB |
| 海报总大小 | ~86 MB |

## 🎓 学习资源

### 前端开发

- [MDN Web Docs](https://developer.mozilla.org/)
- [CSS Tricks](https://css-tricks.com/)
- [JavaScript.info](https://javascript.info/)

### 数据可视化

- [Chart.js 文档](https://www.chartjs.org/)
- [D3.js 文档](https://d3js.org/)
- [Plotly 文档](https://plotly.com/)

### Web 爬虫

- [Beautiful Soup 文档](https://www.crummy.com/software/BeautifulSoup/)
- [Requests 文档](https://requests.readthedocs.io/)
- [Selenium 文档](https://www.selenium.dev/)

---

**最后更新**：2025 年 1 月 17 日  
**版本**：2.0（优化版）  
**维护者**：[Your Name]
