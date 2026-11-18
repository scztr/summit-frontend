const API_URL = "http://127.0.0.1:8000/api/v1";
let refreshRequest = null;

function clearTokens() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
}

function logout() {
    clearTokens();
    window.location.href = "index.html";
}

function redirectToLogin() {
    const next = window.location.pathname + window.location.search;
    window.location.href = "login.html?next=" + encodeURIComponent(next);
}

function refreshAccessToken() {
    if (refreshRequest) {
        return refreshRequest;
    }

    const refresh = localStorage.getItem("refresh_token");

    if (!refresh) {
        return Promise.reject({ status: 401 });
    }

    refreshRequest = $.ajax({
        url: API_URL + "/token/refresh/",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ refresh: refresh })
    }).then(function (response) {
        localStorage.setItem("access_token", response.access);
        return response.access;
    });

    refreshRequest.always(function () {
        refreshRequest = null;
    });

    return refreshRequest;
}

function sendAuthorizedRequest(path, method, data) {
    const options = {
        url: API_URL + path,
        method: method,
        headers: {
            Authorization: "Bearer " + localStorage.getItem("access_token")
        }
    };

    if (data !== undefined) {
        options.contentType = "application/json";
        options.data = JSON.stringify(data);
    }

    return $.ajax(options);
}

async function authRequest(path, method = "GET", data) {
    try {
        return await sendAuthorizedRequest(path, method, data);
    } catch (error) {
        // Ошибки данных, прав доступа или сети не требуют refresh.
        if (error.status !== 401) {
            throw error;
        }
    }

    try {
        await refreshAccessToken();
    } catch (error) {
        if (error.status === 400 || error.status === 401) {
            clearTokens();
            redirectToLogin();
        }

        throw error;
    }

    // Повторяем исходный запрос только один раз.
    try {
        return await sendAuthorizedRequest(path, method, data);
    } catch (error) {
        if (error.status === 401) {
            clearTokens();
            redirectToLogin();
        }

        throw error;
    }
}