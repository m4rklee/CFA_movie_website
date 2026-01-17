import re

with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 修复 renderMoviesList 函数
old_render_movies = """function renderMoviesList() {
  const grid = document.getElementById('moviesGrid');
  const info = document.getElementById('moviesInfo');
  
  // 计算分页
  const totalPages = Math.ceil(filteredMovies.length / MOVIES_PER_PAGE);
  const startIdx = (currentPage - 1) * MOVIES_PER_PAGE;
  const endIdx = startIdx + MOVIES_PER_PAGE;
  const pageMovies = filteredMovies.slice(startIdx, endIdx);
  
  // 更新信息文本
  info.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <span>找到 ${filteredMovies.length} 部电影，第 ${currentPage}/${totalPages} 页</span>
      <div id="pagination" class="pagination"></div>
    </div>
  `;
  
  // 清空网格
  grid.innerHTML = '';
  
  if (filteredMovies.length === 0) {
    grid.innerHTML = '<div class="empty-state" style="grid-column: 1/-1;">没有找到匹配的电影</div>';
    return;
  }

  // 渲染电影卡片
  pageMovies.forEach(movie => {
    const card = createMovieCard(movie);
    grid.appendChild(card);
  });
  
  // 渲染分页控件
  renderPagination(totalPages);
}"""

new_render_movies = """function renderMoviesList() {
  const grid = document.getElementById('moviesGrid');
  const info = document.getElementById('moviesInfo');
  
  // 计算分页
  const totalPages = Math.ceil(filteredMovies.length / MOVIES_PER_PAGE);
  const startIdx = (currentPage - 1) * MOVIES_PER_PAGE;
  const endIdx = startIdx + MOVIES_PER_PAGE;
  const pageMovies = filteredMovies.slice(startIdx, endIdx);
  
  // 清空网格
  grid.innerHTML = '';
  
  if (filteredMovies.length === 0) {
    grid.innerHTML = '<div class="empty-state" style="grid-column: 1/-1;">没有找到匹配的电影</div>';
    info.innerHTML = '';
    return;
  }

  // 渲染电影卡片
  pageMovies.forEach(movie => {
    const card = createMovieCard(movie);
    grid.appendChild(card);
  });
  
  // 更新信息文本（位于底部）
  info.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 2rem;">
      <span>找到 ${filteredMovies.length} 部电影，第 ${currentPage}/${totalPages} 页</span>
      <div id="pagination" class="pagination"></div>
    </div>
  `;
  
  // 渲染分页控件
  renderPagination(totalPages);
}"""

content = content.replace(old_render_movies, new_render_movies)

# 修复 renderListMoviesList 函数
old_render_list = """function renderListMoviesList() {
  const grid = document.getElementById('listMoviesGrid');
  const info = document.getElementById('listMoviesInfo');
  
  // 计算分页
  const totalPages = Math.ceil(listMovies.length / MOVIES_PER_PAGE);
  const startIdx = (currentListPage - 1) * MOVIES_PER_PAGE;
  const endIdx = startIdx + MOVIES_PER_PAGE;
  const pageMovies = listMovies.slice(startIdx, endIdx);
  
  // 更新信息文本
  info.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <span>${currentListYear}年豆列共 ${listMovies.length} 部电影，第 ${currentListPage}/${totalPages} 页</span>
      <div id="listPagination" class="pagination"></div>
    </div>
  `;
  
  // 清空网格
  grid.innerHTML = '';
  
  if (listMovies.length === 0) {
    grid.innerHTML = '<div class="empty-state" style="grid-column: 1/-1;">该年份暂无电影</div>';
    return;
  }

  // 渲染电影卡片
  pageMovies.forEach(movie => {
    const card = createMovieCard(movie);
    grid.appendChild(card);
  });
  
  // 渲染分页控件
  renderListPagination(totalPages);
}"""

new_render_list = """function renderListMoviesList() {
  const grid = document.getElementById('listMoviesGrid');
  const info = document.getElementById('listMoviesInfo');
  
  // 计算分页
  const totalPages = Math.ceil(listMovies.length / MOVIES_PER_PAGE);
  const startIdx = (currentListPage - 1) * MOVIES_PER_PAGE;
  const endIdx = startIdx + MOVIES_PER_PAGE;
  const pageMovies = listMovies.slice(startIdx, endIdx);
  
  // 清空网格
  grid.innerHTML = '';
  
  if (listMovies.length === 0) {
    grid.innerHTML = '<div class="empty-state" style="grid-column: 1/-1;">该年份暂无电影</div>';
    info.innerHTML = '';
    return;
  }

  // 渲染电影卡片
  pageMovies.forEach(movie => {
    const card = createMovieCard(movie);
    grid.appendChild(card);
  });
  
  // 更新信息文本（位于底部）
  info.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 2rem;">
      <span>${currentListYear}年豆列共 ${listMovies.length} 部电影，第 ${currentListPage}/${totalPages} 页</span>
      <div id="listPagination" class="pagination"></div>
    </div>
  `;
  
  // 渲染分页控件
  renderListPagination(totalPages);
}"""

content = content.replace(old_render_list, new_render_list)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("翻页位置修改完成")
