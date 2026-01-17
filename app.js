/*
 * Cinema Archive Vault - 应用程序逻辑（高性能重构版）
 * 纯 JavaScript 实现
 * 功能：数据可视化、电影列表、搜索、筛选、排序、分页、豆列电影
 * 修改日志：兼容 list_years 数组结构
 */

// 全局状态
let appData = null;
let filteredMovies = [];
let listMovies = [];
let currentYear = null;
let currentListYear = null;
let currentPage = 1;
let currentListPage = 1;
const MOVIES_PER_PAGE = 30;
let searchTimeout = null;
let isProcessing = false;

// 初始化应用
document.addEventListener('DOMContentLoaded', async () => {
  try {
    appData = await loadData();
    if (!appData) {
      showError('无法加载数据');
      return;
    }

    initializeUI();
    setupEventListeners();
    updateDashboard();
    updateMoviesListAsync();
    updateListMoviesAsync();
  } catch (error) {
    console.error('初始化失败:', error);
    showError('应用初始化失败');
  }
});

/**
 * 加载数据
 */
async function loadData() {
  try {
    const timestamp = new Date().getTime();
    const response = await fetch(`processed_movies.json?t=${timestamp}`);
    if (!response.ok) throw new Error('Failed to load data');
    return await response.json();
  } catch (error) {
    console.error('数据加载失败:', error);
    return null;
  }
}

/**
 * 辅助函数：检查电影是否属于特定年份（兼容 list_year 字符串和 list_years 数组）
 */
function isMovieInListYear(movie, year) {
    const strYear = String(year);
    // 情况1: 新数据结构，是数组且包含该年份
    if (movie.list_years && Array.isArray(movie.list_years) && movie.list_years.includes(strYear)) {
        return true;
    }
    // 情况2: 旧数据结构，是字符串且相等
    if (movie.list_year && String(movie.list_year) === strYear) {
        return true;
    }
    return false;
}

/**
 * 初始化 UI
 */
function initializeUI() {
  const years = Object.keys(appData.stats_by_year).sort((a, b) => parseInt(b) - parseInt(a));
  const yearsDisplay = years.join('、');
  
  document.getElementById('headerDesc').textContent = 
    `收录 ${appData.unique_movies.length} 部电影，涵盖年份：${yearsDisplay}`;
  
  const footerInfo = document.getElementById('footerInfo');
  if (footerInfo) {
    footerInfo.textContent = `数据: ${appData.unique_movies.length} 部电影 | 豆列年份：${yearsDisplay}`;
  }

  currentYear = years[0];
  currentListYear = years[0];

  generateYearSelector('yearSelector', years, currentYear, selectYear);
  generateYearSelector('listYearSelector', years, currentListYear, selectListYear);
  
  generateFilterOptions('yearFilter', Array.from(new Set(appData.unique_movies.map(m => m.movie_year))).filter(Boolean).sort((a, b) => b - a));
  generateFilterOptions('genreFilter', appData.global_stats.all_genres);
  
  // 提取所有不重复的国家地区
  const countries = new Set();
  appData.unique_movies.forEach(m => {
    if (m.country) {
      m.country.split('/').forEach(c => countries.add(c.trim()));
    }
  });
  generateFilterOptions('countryFilter', Array.from(countries).sort());
}

/**
 * 通用年份选择器生成
 */
function generateYearSelector(containerId, years, current, callback) {
  const selector = document.getElementById(containerId);
  if (!selector) return;
  selector.innerHTML = '';
  
  years.forEach(year => {
    const btn = document.createElement('button');
    btn.className = `year-btn ${String(year) === String(current) ? 'active' : ''}`;
    btn.textContent = `${year}年`;
    btn.dataset.year = year;
    btn.addEventListener('click', () => callback(year));
    selector.appendChild(btn);
  });
}

/**
 * 通用筛选选项生成
 */
function generateFilterOptions(selectId, options) {
  const select = document.getElementById(selectId);
  if (!select) return;
  options.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt;
    option.textContent = opt;
    select.appendChild(option);
  });
}

function selectYear(year) {
  currentYear = year;
  updateYearBtnActive('yearSelector', year);
  updateDashboard();
}

function selectListYear(year) {
  currentListYear = year;
  currentListPage = 1;
  updateYearBtnActive('listYearSelector', year);
  updateListMoviesAsync();
}

function updateYearBtnActive(containerId, year) {
  document.querySelectorAll(`#${containerId} .year-btn`).forEach(btn => {
    btn.classList.toggle('active', String(btn.dataset.year) === String(year));
  });
}

/**
 * 设置事件监听
 */
function setupEventListeners() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        currentPage = 1;
        updateMoviesListAsync();
      }, 300);
    });
  }
  
  ['yearFilter', 'genreFilter', 'countryFilter', 'sortFilter'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', () => {
        currentPage = 1;
        updateMoviesListAsync();
      });
    }
  });
}

function switchTab(tabName) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  
  const panel = document.getElementById(tabName);
  if (panel) panel.classList.add('active');
  const btn = document.querySelector(`[data-tab="${tabName}"]`);
  if (btn) btn.classList.add('active');
}

/**
 * 更新仪表板 (已修复导演计数为0的问题)
 */
/**
 * 更新仪表板 (完全重构：前端实时计算统计数据)
 * 解决 JSON 预计算数据与 list_years 数组结构不匹配导致 undefined 的问题
 */
function updateDashboard() {
  // 1. 实时筛选出当前年份（豆列年份）下的所有电影
  const currentYearMovies = appData.unique_movies.filter(movie => 
    isMovieInListYear(movie, currentYear)
  );

  // 如果没有数据，清空图表并返回
  if (currentYearMovies.length === 0) {
    document.getElementById('statMovies').textContent = 0;
    document.getElementById('statCountries').textContent = 0;
    document.getElementById('statGenres').textContent = 0;
    document.getElementById('statDirectors').textContent = 0;
    renderChart('genreChart', []);
    renderChart('countryChart', []);
    renderChart('directorChart', []);
    return;
  }

  // 2. 实时计算各项统计
  const genreStats = calculateStats(currentYearMovies, 'genres_list', true); // genres_list 是数组
  const countryStats = calculateStats(currentYearMovies, 'country', false);   // country 是字符串，需分割
  const directorStats = calculateStats(currentYearMovies, 'director', false); // director 是字符串，需分割

  // 3. 更新顶部数字卡片
  document.getElementById('statMovies').textContent = currentYearMovies.length;
  document.getElementById('statCountries').textContent = countryStats.length;
  document.getElementById('statGenres').textContent = genreStats.length;
  document.getElementById('statDirectors').textContent = directorStats.length;
  
  // 4. 更新图表 (取前10名)
  renderChart('genreChart', genreStats.slice(0, 10));
  renderChart('countryChart', countryStats.slice(0, 10));
  renderChart('directorChart', directorStats.slice(0, 10));
}

/**
 * 辅助函数：统计分布情况
 * @param {Array} movies - 电影列表
 * @param {String} field - 要统计的字段名
 * @param {Boolean} isArrayField - 字段是否已经是数组 (如 genres_list)
 */
function calculateStats(movies, field, isArrayField) {
  const counts = {};

  movies.forEach(movie => {
    let items = [];
    const value = movie[field];

    if (!value) return;

    if (isArrayField) {
      // 如果已经是数组 (例如 genres_list)
      items = value;
    } else {
      // 如果是字符串 (例如 "美国 / 英国")，需要分割
      items = String(value).split('/').map(s => s.trim());
    }

    items.forEach(item => {
      if (item) {
        counts[item] = (counts[item] || 0) + 1;
      }
    });
  });

  // 转换为数组并按数量降序排序
  return Object.keys(counts)
    .map(name => ({ name: name, count: counts[name] }))
    .sort((a, b) => b.count - a.count);
}
/**
 * 渲染图表
 */
function renderChart(containerId, data) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  
  if (!data || data.length === 0) {
    container.innerHTML = '<p style="color: var(--color-text-secondary);">暂无数据</p>';
    return;
  }

  const displayData = data.slice(0, 10);
  const maxValue = Math.max(...displayData.map(item => item.count));
  const colors = [
    'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
    'linear-gradient(90deg, #ec4899 0%, #f472b6 100%)',
    'linear-gradient(90deg, #14b8a6 0%, #2dd4bf 100%)',
    'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
    'linear-gradient(90deg, #10b981 0%, #34d399 100%)'
  ];
  
  displayData.forEach((item, index) => {
    const percentage = (item.count / maxValue) * 100;
    const itemEl = document.createElement('div');
    itemEl.className = 'chart-item';
    itemEl.innerHTML = `
      <div class="chart-label" title="${item.name}">${item.name}</div>
      <div class="chart-bar-container">
        <div class="chart-bar" style="background: ${colors[index % colors.length]}; width: ${percentage}%"></div>
      </div>
      <div class="chart-value">${item.count}</div>
    `;
    container.appendChild(itemEl);
  });
}

/**
 * 异步更新电影列表
 */
function updateMoviesListAsync() {
  if (isProcessing) return;
  isProcessing = true;
  
  const searchText = document.getElementById('searchInput').value.toLowerCase();
  const yearFilter = document.getElementById('yearFilter').value;
  const genreFilter = document.getElementById('genreFilter').value;
  const countryFilter = document.getElementById('countryFilter').value;
  const sortBy = document.getElementById('sortFilter').value;

  setTimeout(() => {
    try {
      filteredMovies = appData.unique_movies.filter(movie => {
        if (searchText && !(movie.title.toLowerCase().includes(searchText) || 
            (movie.director && movie.director.toLowerCase().includes(searchText)) ||
            (movie.actors && movie.actors.toLowerCase().includes(searchText)))) return false;
        if (yearFilter && movie.movie_year !== yearFilter) return false;
        if (genreFilter && !movie.genres_list.includes(genreFilter)) return false;
        if (countryFilter && !(movie.country && movie.country.includes(countryFilter))) return false;
        return true;
      });

      filteredMovies = sortMovies(filteredMovies, sortBy);
      renderGenericMoviesList('moviesGrid', 'moviesInfo', filteredMovies, currentPage, (p) => {
        currentPage = p;
        updateMoviesListAsync();
      });
    } finally {
      isProcessing = false;
    }
  }, 0);
}

/**
 * 异步更新豆列电影列表 (已兼容 list_years 数组)
 */
function updateListMoviesAsync() {
  // 使用辅助函数进行筛选
  listMovies = appData.unique_movies.filter(movie => isMovieInListYear(movie, currentListYear));
  
  listMovies = sortMovies(listMovies, 'rating-desc');
  renderGenericMoviesList('listMoviesGrid', 'listMoviesInfo', listMovies, currentListPage, (p) => {
    currentListPage = p;
    updateListMoviesAsync();
  });
}

/**
 * 通用电影列表渲染函数
 */
function renderGenericMoviesList(gridId, infoId, movies, page, onPageChange) {
  const grid = document.getElementById(gridId);
  const info = document.getElementById(infoId);
  if (!grid || !info) return;

  const totalPages = Math.ceil(movies.length / MOVIES_PER_PAGE);
  const pageMovies = movies.slice((page - 1) * MOVIES_PER_PAGE, page * MOVIES_PER_PAGE);
  
  grid.innerHTML = '';
  if (movies.length === 0) {
    grid.innerHTML = '<div class="empty-state" style="grid-column: 1/-1;">没有找到匹配的电影</div>';
    info.innerHTML = '';
    return;
  }

  pageMovies.forEach(movie => grid.appendChild(createMovieCard(movie)));
  
  info.innerHTML = `<div class="pagination-container"><div class="pagination"></div></div>`;
  renderPaginationButtons(info.querySelector('.pagination'), page, totalPages, onPageChange);
}

/**
 * 排序电影
 */
function sortMovies(movies, sortBy) {
  const sorted = [...movies];
  const getRating = (m) => parseFloat(m.rating === '暂无评分' ? '0' : m.rating);
  
  switch (sortBy) {
    case 'rating-desc': sorted.sort((a, b) => getRating(b) - getRating(a)); break;
    case 'rating-asc': sorted.sort((a, b) => getRating(a) - getRating(b)); break;
    case 'title': sorted.sort((a, b) => a.title.localeCompare(b.title)); break;
    case 'year-desc': sorted.sort((a, b) => parseInt(b.movie_year || '0') - parseInt(a.movie_year || '0')); break;
    case 'year-asc': sorted.sort((a, b) => parseInt(a.movie_year || '0') - parseInt(b.movie_year || '0')); break;
  }
  return sorted;
}

/**
 * 分页按钮生成
 */
function renderPaginationButtons(container, current, total, onPageChange) {
  if (total <= 1) return;
  
  const addBtn = (text, target, active = false) => {
    const btn = document.createElement('button');
    btn.className = `pagination-btn ${active ? 'active' : ''}`;
    btn.textContent = text;
    btn.addEventListener('click', () => {
      onPageChange(target);
      // 移动端滚动优化：滚动到列表顶部而非页面最顶部，体验更好
      const scrollTarget = document.querySelector('.tabs') || document.body;
      scrollTarget.scrollIntoView({ behavior: 'smooth' });
    });
    container.appendChild(btn);
  };

  if (current > 1) addBtn('← 上一页', current - 1);
  
  // 移动端适配：如果屏幕较窄，显示更少的页码
  const isMobile = window.innerWidth <= 480;
  const delta = isMobile ? 1 : 2;
  
  const start = Math.max(1, current - delta);
  const end = Math.min(total, current + delta);
  
  if (start > 1) {
    addBtn('1', 1);
    if (start > 2) {
      const dots = document.createElement('span');
      dots.className = 'pagination-dots';
      dots.textContent = '...';
      container.appendChild(dots);
    }
  }
  
  for (let i = start; i <= end; i++) addBtn(i, i, i === current);
  
  if (end < total) {
    if (end < total - 1) {
      const dots = document.createElement('span');
      dots.className = 'pagination-dots';
      dots.textContent = '...';
      container.appendChild(dots);
    }
    addBtn(total, total);
  }
  
  if (current < total) addBtn('下一页 →', current + 1);
}

/**
 * 电影名称清洗
 */
function cleanMovieTitle(text) {
  if (!text) return "";

  text = text.trim();

  // 1. 强力切割：双空格及以上
  // JS 的 split 支持正则
  const parts = text.split(/\s{2,}/);
  if (parts.length > 1) {
    return parts[0].trim();
  }

  // 2. 异种语言截断 (针对：福音战士、霸王别姬、悲惨世界)
  // 排除法：匹配 [空格] + [非中文、非数字、非中文标点的第一个字符]
  // JS 中 match[1] 对应 Python 的 group(1)
  const foreignRegex = /^(.*?)\s+([^0-9\u4e00-\u9fa5\uff01-\uff1f\u3001-\u3011])/;
  const foreignMatch = text.match(foreignRegex);
  if (foreignMatch) {
    return foreignMatch[1].trim();
  }

  // 3. 对称性与重复识别 (针对：三生三世、卧虎藏龙)
  if (text.includes(' ')) {
    // 寻找所有空格的位置
    const spaces = [];
    for (let i = 0; i < text.length; i++) {
      if (text[i] === ' ') spaces.push(i);
    }

    if (spaces.length > 0) {
      const mid = Math.floor(text.length / 2);
      // 找到最靠近中间的那个空格
      const centerSpaceIdx = spaces.reduce((prev, curr) => 
        Math.abs(curr - mid) < Math.abs(prev - mid) ? curr : prev
      );

      const p1 = text.substring(0, centerSpaceIdx).trim();
      const p2 = text.substring(centerSpaceIdx).trim();

      // 判定：长度相等 (简繁对照通常等长)
      if (p1.length === p2.length && p1.length > 1) {
        return p1;
      }

      // 判定：首字相同 (完全重复或部分重复)
      if (p1.length > 0 && p2.length > 0 && p1[0] === p2[0]) {
        return p1;
      }
    }
  }

  return text;
}

/**
 * 创建电影卡片
 */
function createMovieCard(movie) {
  const card = document.createElement('div');
  card.className = 'movie-card';
  const picUrl = movie.image_url;
  const picIdMatch = picUrl.match(/p(\d+)/);
  const picId = picIdMatch ? picIdMatch[1] : null;
  // const movieIdMatch = movie.url.match(/\/subject\/(\d+)\//);
  // const movieId = movieIdMatch ? movieIdMatch[1] : null;

  const posterPath = picId ? `images/posters/${picId}.webp` : null;
  
  const rating = parseFloat(movie.rating === '暂无评分' ? '0' : movie.rating);
  const stars = Math.round(rating / 2);
  let starsHtml = '';
  for (let i = 0; i < 5; i++) starsHtml += `<span class="star ${i < stars ? '' : 'empty'}">★</span>`;
  movie.title = cleanMovieTitle(movie.title)
  card.innerHTML = `
    <div class="movie-poster">
      ${posterPath ? `<img src="${posterPath}" alt="${movie.title}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">` : ''}
      <div class="movie-poster-placeholder" ${posterPath ? 'style="display: none;"' : ''}>无海报</div>
      <div class="movie-overlay">
        <a href="${movie.url}" target="_blank" rel="noopener noreferrer" title="在豆瓣查看">🔗</a>
      </div>
    </div>
    <div class="movie-info">
      <h3 class="movie-title" title="${movie.title}">${movie.title}</h3>
      <div class="movie-rating">
        <div class="movie-stars">${starsHtml}</div>
        <span class="movie-score">${movie.rating}</span>
      </div>
      <div class="movie-meta">
        <strong>${movie.country}</strong> · ${movie.movie_year}
      </div>
      <div class="movie-tags">
        ${movie.genres_list.slice(0, 3).map(genre => `<span class="movie-tag">${genre}</span>`).join('')}
      </div>
    </div>
  `;
  return card;
}

function showError(message) {
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = `<div class="error-state">${message}</div>`;
  }
}