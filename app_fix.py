import re

with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 修复 updateListMoviesAsync 函数
old_func = """/**
 * 异步更新豆列电影列表
 */
function updateListMoviesAsync() {
  if (isProcessing) return;
  isProcessing = true;
  
  // 使用 setTimeout 让出主线程
  setTimeout(() => {
    try {
      // 过滤指定年份的电影
      listMovies = appData.unique_movies.filter(movie => {
        return String(movie.list_year) === String(currentListYear);
      });

      // 按评分降序排序
      listMovies = sortMovies(listMovies, 'rating-desc');

      // 渲染豆列电影列表
      renderListMoviesList();
    } finally {
      isProcessing = false;
    }
  }, 0);
}"""

new_func = """/**
 * 异步更新豆列电影列表
 */
function updateListMoviesAsync() {
  // 过滤指定年份的电影
  listMovies = appData.unique_movies.filter(movie => {
    return String(movie.list_year) === String(currentListYear);
  });

  // 按评分降序排序
  listMovies = sortMovies(listMovies, 'rating-desc');

  // 渲染豆列电影列表
  renderListMoviesList();
}"""

content = content.replace(old_func, new_func)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("修复完成")
