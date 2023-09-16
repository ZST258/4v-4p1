function setupPaginationButtons(prevButtonId, nextButtonId, pageTemplate, pageIndex) {
    const prevPageButton = document.getElementById(prevButtonId);
    const nextPageButton = document.getElementById(nextButtonId);

    // 处理上一页按钮点击事件
    prevPageButton.addEventListener('click', function () {
        if (pageIndex > 1) {
            const prevPageIndex = pageIndex - 1;
            const prevPageUrl = `${pageTemplate}/${prevPageIndex}`;
            window.location.href = prevPageUrl;
        }
    });

    // 处理下一页按钮点击事件
    nextPageButton.addEventListener('click', function () {
        // 在这里添加逻辑，根据需要生成下一页的URL
        const nextPageIndex = pageIndex + 1;
        const nextPageUrl = `${pageTemplate}/${nextPageIndex}`;
        window.location.href = nextPageUrl;
    });

    // 如果当前页码为第一页，则禁用上一页按钮
    if (pageIndex === 1) {
        prevPageButton.disabled = true;
    }
}

function setupPaginationButtons1(prevButtonId, nextButtonId, pageTemplate, pageIndex) {
    const prevPageButton = document.getElementById(prevButtonId);
    const nextPageButton = document.getElementById(nextButtonId);

    // 处理上一页按钮点击事件
    prevPageButton.addEventListener('click', function () {
        if (pageIndex > 1) {
            const prevPageIndex = pageIndex - 1;
            const prevPageUrl = `${pageTemplate}${prevPageIndex}`;
            window.location.href = prevPageUrl;
        }
    });

    // 处理下一页按钮点击事件
    nextPageButton.addEventListener('click', function () {
        // 在这里添加逻辑，根据需要生成下一页的URL
        const nextPageIndex = pageIndex + 1;
        const nextPageUrl = `${pageTemplate}${nextPageIndex}`;
        window.location.href = nextPageUrl;
    });

    // 如果当前页码为第一页，则禁用上一页按钮
    if (pageIndex === 1) {
        prevPageButton.disabled = true;
    }
}
