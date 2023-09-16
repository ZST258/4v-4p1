// search.js

// 获取搜索输入框和按钮的引用
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');

// 添加事件监听器，当用户按下Enter键时触发搜索操作
searchInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        performSearch();
    }
});

// 添加事件监听器，当用户点击按钮时触发搜索操作
searchButton.addEventListener('click', function () {
    performSearch();
});

// 执行搜索操作的函数
function performSearch() {
    const searchValue = searchInput.value.trim();

    // 检查输入是否为空
    if (searchValue === '') {
        alert('请输入搜索内容');
        return;
    }

    // 构建搜索链接
    const searchUrl = `/find?wd=${encodeURIComponent(searchValue)}`;

    // 执行搜索操作，跳转到搜索链接
    window.location.href = searchUrl;
}
