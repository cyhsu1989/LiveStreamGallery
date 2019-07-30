var clientID = "4ubi9q0wftd8f143kow3puugggwon0";
var num = 20;
var gameName = "League of Legends";
var gameID = "";
var data = [];
var pagination = "";
var isLoading = true;
var defaultLang = "en";
var currentLang = defaultLang;

if (gameName) {
    fetch("https://api.twitch.tv/helix/games?name=" + gameName, {
        method: 'GET',
        headers: {
            "Client-ID": clientID
        }
    }).then(response => response.json()).then(jsonData => {
        gameID = jsonData.data[0] ? jsonData.data[0].id : "";
        getStreams({
            "game_id": gameID,
            "first": num,
            "language": currentLang || defaultLang || ""
        });
    }).catch((err) => {
        console.log('Error: ', err);
    });
} else {
    getStreams({
        "first": num,
        "language": currentLang || defaultLang || ""
    });
}

document.addEventListener("DOMContentLoaded", function() {
    window.addEventListener("scroll", function() {        
        if (window.pageYOffset + window.innerHeight >= (document.documentElement.offsetHeight - 200)) {
            if (pagination && (!isLoading)) {
                isLoading = true;
                getStreams({
                    "after": pagination.cursor,
                    "language": currentLang || defaultLang || ""
                });
            }
        }
    });

    document.querySelectorAll('li[data-lang]').forEach(key => {
        if(key.dataset.lang === currentLang) {
            key.classList.add('active');
        }

        key.addEventListener('click', setLanguage);
    });
});

function setLanguage() {
    if(currentLang === this.dataset.lang) {
        return;
    }

    document.querySelectorAll('li[data-lang]').forEach(key => key.classList.remove('active'));
    currentLang = this.dataset.lang;
    this.classList.add('active');

    document.querySelectorAll('[data-i18n]').forEach(key => {
        key.innerHTML = window.I18N[currentLang][key.getAttribute('data-i18n')];
    });

    reGenerateStreams();
}

function reGenerateStreams() {
    document.querySelector(".container").innerHTML = '';

    isLoading = true;
    getStreams({
        "game_id": gameID,
        "first": num,
        "language": currentLang || defaultLang || ""
    });
}

function getStreams(params) {
    let queryParams = Object.keys(params)
        .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
        .join('&');

    fetch("https://api.twitch.tv/helix/streams?" + queryParams, {
        method: 'GET',
        headers: {
            "Client-ID": clientID
        }
    }).then(response => response.json()).then(jsonData => {
        pagination = jsonData.pagination;
        getUserDataByUserIds(jsonData.data);
    }).catch(err => {
        console.log("Error: " + err);
    });
}

function getUserDataByUserIds(streamData) {
    var userIDs = "?id=";

    for (let i = 0; i < streamData.length; i++) {
        const element = streamData[i];

        if (i === streamData.length - 1) {
            userIDs += element.user_id;
        } else {
            userIDs += element.user_id + "&id=";
        }
    }

    fetch("https://api.twitch.tv/helix/users" + userIDs, {
        method: 'GET',
        headers: {
            "Client-ID": clientID
        }
    }).then(response => response.json()).then(jsonData => {
        for (let i = 0; i < jsonData.data.length; i++) {
            streamData[i]["userData"] = jsonData.data[i];
        }
        renderItems(streamData);
        isLoading = false;
    }).catch(err => {
        console.log("Error: " + err);
    });
}

function renderItems(data) {
    document.querySelectorAll('.item.fake').forEach(key => key.remove());

    data.forEach(element => {
        var item = document.getElementById("__template__").children.item(0).cloneNode(true);

        item.querySelector(".channel-preview").setAttribute("src", element.thumbnail_url.replace("{width}", 320).replace("{height}", 180));
        item.querySelector(".channel-info .avatar").setAttribute("src", element.userData.profile_image_url);
        item.querySelector(".channel-info .title").innerHTML = element.title;
        item.querySelector(".channel-info .name").innerHTML = element.user_name;

        document.querySelector(".container").appendChild(item);
    });

    for (let i = 0; i < (data.length % 3); i++) {
        document.querySelector(".container").insertAdjacentHTML("beforeend", "<div class='item fake' style='visibility: hidden;'></div>");
    }
}