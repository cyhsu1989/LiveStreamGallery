var clientID = "4ubi9q0wftd8f143kow3puugggwon0";
var num = 20;
var gameName = "League of Legends";
var gameID = "";
var data = [];
var pagination = "";
var isLoading = true;

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
            "first": num
        });
    }).catch((err) => {
        console.log('Error: ', err);
    });
} else {
    getStreams({
        "first": num
    });
}

$(document).ready(function () {
    $(window).scroll(function () {
        if ($(window).scrollTop() + $(window).height() >= ($(document).height() - 200)) {
            if (pagination && (!isLoading)) {
                isLoading = true;
                getStreams({
                    "after": pagination.cursor
                });
            }
        }
    });
});


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
    $(".item.fake").remove();

    data.forEach(element => {
        var item = $(".template").children().clone();
        $(item).find(".channel-preview").attr("src", element.thumbnail_url.replace("{width}", 320).replace("{height}", 180));
        $(item).find(".channel-info .title").html(element.title);
        $(item).find(".channel-info .name").html(element.user_name);
        $(item).find(".channel-info .avatar").attr("src", element.userData.profile_image_url);

        $(".container").append(item);
    });

    for (let i = 0; i < (data.length % 3); i++) {
        $(".container").append("<div class='item fake' style='visibility: hidden;'></div>");
    }
}