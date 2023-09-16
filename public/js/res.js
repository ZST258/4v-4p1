function setWithExpiry(key, value, minutes) {
    const now = new Date();
    const item = {
        value: value,
        expiry: now.getTime() + minutes * 60 * 1000
    };
    localStorage.setItem(key, JSON.stringify(item))
}

function getWithExpiry(key) {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) {
        return null
    }
    const item = JSON.parse(itemStr);
    const now = new Date();
    if (now.getTime() > item.expiry) {
        localStorage.removeItem(key);
        return null
    }
    return item.value
}

async function fetchData(code, type) {
  const url = "/api";
  let postType = type;
  
  if (type === "expng") {
    postType = "info";
  }
  
  const data = {
    code: code,
    type: postType
  };
  
  const cachedData = getWithExpiry(`${type}|${code}`);
  
  if (cachedData) {
    const parsedData = JSON.parse(cachedData);
    switch (type) {
      case 'magnet':
        displayMagnetLinks(parsedData);
        break;
      case 'info':
        displayResponse(parsedData);
        break;
      case 'rate':
        displayRates(parsedData);
        break;
      case 'expng':
        displayExtraArts(parsedData);
        break;
      default:
        break;
    }
  } else {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      if (response.ok && response.message !== "请求错误" && response.message !== "null") {
        const responseData = await response.json();
        setWithExpiry(`${type}|${code}`, JSON.stringify(responseData), 20);
        switch (type) {
          case 'magnet':
            displayMagnetLinks(responseData);
            break;
          case 'info':
            displayResponse(responseData);
            break;
          case 'rate':
            displayRates(responseData);
            break;
          case 'expng':
            displayExtraArts(responseData);
            break;
          default:
            break;
        }
      } else {
        throw new Error("请求失败: " + response.status + " " + response.statusText);
      }
    } catch (error) {
      window.location.href = '/error/404'
    }
  }
}


function displayResponse(responseData) {
    var responseDiv = document.getElementById("responseDiv");
    var titleElement = document.getElementById("title");
    var imageElement = document.getElementById("image");
    image.setAttribute("data-src", responseData.message.cover);
    var expandedImageElement = document.querySelector(".expanded");
    titleElement.textContent = responseData.message.title;
    expandedImageElement.src = responseData.message.cover;
    var movieInfoDiv = document.createElement("div");
    movieInfoDiv.classList.add("movie-info");
    movieInfoDiv.innerHTML += `<div class="info-item"><p class="info-code"><span>番号：</span>${responseData.message.code}<span class="copy-icon fa fa-copy" copyvalue="${responseData.message.code}" onclick="copyToClipboard(this)"></span></p></div><div class="info-item"><p class="info-time"><span>发行日期：</span>${responseData.message.date}</p></div><div class="info-item"><p class="info-time"><span>时长：</span>${responseData.message.length.replace('分鐘','分钟')}</p></div>`;
    if (responseData.message.director.text) {
        movieInfoDiv.innerHTML += `<div class="info-item"><p class="info-org"><span>导演：</span><a href="${responseData.message.director.href.replace('https://www.javbus.com','')}">${responseData.message.director.text}</a></p></div>`
    }
    if (responseData.message.maker.text) {
        movieInfoDiv.innerHTML += `<div class="info-item"><p class="info-org"><span>制片商：</span><a href="${responseData.message.maker.href.replace('https://www.javbus.com','')}">${responseData.message.maker.text}</p></div>`
    }
    if (responseData.message.publisher.text) {
        movieInfoDiv.innerHTML += `<div class="info-item"><p class="info-org"><span>发行商：</span><a href="${responseData.message.publisher.href.replace('https://www.javbus.com','')}">${responseData.message.publisher.text}</a></p></div>`
    }
    if (responseData.message.series.text) {
        movieInfoDiv.innerHTML += `<div class="info-item"><p class="info-org"><span>系列：</span><a href="${responseData.message.series.href.replace('https://www.javbus.com','')}">${responseData.message.series.text}</a></p></div>`
    }
    if (responseData.message.actress && responseData.message.actress.length > 0) {
        movieInfoDiv.innerHTML += `<div class="info-item"><ul class="list actress"><span>演员：</span>${responseData.message.actress.map((actress,index)=>`<li><a href="${actress.href.replace('https://www.javbus.com','')}">${actress.text}</a></li>`).join("/ ")}</ul></div>`
    }
    if (responseData.message.genre && responseData.message.genre.length > 0) {
        movieInfoDiv.innerHTML += `<div class="info-item"><ul class="list genre"><span>类型：</span>${responseData.message.genre.map((genre)=>`<li><a href="${genre.href.replace('https://www.javbus.com','')}">${genre.text}</a></li>`).join("/ ")}</ul></div>`
    }
    responseDiv.appendChild(movieInfoDiv)
}

function displayError(errorMessage) {
    var responseDiv = document.getElementById("responseDiv");
    responseDiv.innerHTML = errorMessage
}

function displayMagnetLinks(responseData) {
    const magnetContainer = document.getElementById('func-container');
    responseData.message.forEach((magnetInfo) => {
        const magnetDiv = document.createElement('div');
        magnetDiv.classList.add('magLink');
        magnetDiv.innerHTML = `<div class="mag-info-1"><h4>${magnetInfo.title}</h4><p class="mag-size">${magnetInfo.size}</p><ul class="mag-tags">${magnetInfo.tags.map((magnet)=>`<li>${magnet}</li>`).join(" ")}</ul></div><div class="mag-info-2"><p class="mag-date">${magnetInfo.date}</p><button class="button"copyvalue="${magnetInfo.url}"onclick="copyToClipboard(this)"">复制</a>
              </div>
            `;
        magnetContainer.appendChild(magnetDiv);
    });
}

function displayRates(responseData) {
    const rateContainer = document.getElementById('func-container');
    const rateDiv = document.createElement('div');
    rateDiv.classList.add('rate-item');
    const rateElement = document.createElement('h3');
    rateElement.textContent = `评分: ${responseData.message.rate}`;
    rateDiv.appendChild(rateElement);
    const reviewsAndLikesElement = document.createElement('div');
    responseData.message.reviews.forEach((review, index) => {
        const comment = document.createElement('div');
        comment.classList.add('comment');
        const reviewChHtml = `
      <div class="comment-textbox">
        <p>${review}</p>
      </div>
      <div class="comment-info">
        <div class="comment-icon">
          <i class="fa fa-heart"></i>
        </div>
        <div class="comment-likes">
          <span>${responseData.message.likes[index]}</span>
        </div>
      </div>
    `;
        comment.innerHTML = reviewChHtml;
        reviewsAndLikesElement.appendChild(comment);
    });
    rateDiv.appendChild(reviewsAndLikesElement);
    rateContainer.appendChild(rateDiv);
}

function displayExtraArts(responseData) {
  const artContainer = document.getElementById('func-container');
  const artUrls = responseData.message.extrafanart;

  artUrls.forEach((url, index) => {
    const fanart = document.createElement('div');
    fanart.classList.add('fanart');
    fanart.innerHTML = `
      <img src="/image/loading.gif" data-src="${url}" alt="Image" class="normal lazyload" onerror='this.onerror=null; this.src="/image/no_preview_lg.jpg"' />
      <div class="fullscreen" id="fullscreen-${index}">
        <img src="${url}" alt="Image" class="expanded" />
        <button class="close" id="close-${index}">关闭</button>
      </div>`;
    artContainer.appendChild(fanart);
  });

  // 事件委托，处理按钮点击事件
  artContainer.addEventListener('click', (event) => {
    const target = event.target;

    // 检查点击的是按钮（.normal）或关闭按钮（.close）
    if (target.classList.contains('normal')) {
      const fullscreenDiv = target.parentElement.querySelector('.fullscreen');
      fullscreenDiv.style.display = 'flex';
    } else if (target.classList.contains('close')) {
      const fullscreenDiv = target.parentElement;
      fullscreenDiv.style.display = 'none';
    }
  });
}
