$("#logout-button").on("click", logout);

function showUser(user) {
    $("#login-link").prop("hidden", true);
    $("#register-link").prop("hidden", true);
    $("#user-name").text(user.first_name || user.username);
    $("#logout-button").prop("hidden", false);
}

async function loadNavigation() {
    const access = localStorage.getItem("access_token");
    const refresh = localStorage.getItem("refresh_token");

    if (!access && !refresh) {
        return;
    }

    try {
        const user = await sendAuthorizedRequest("/users/me", "GET");
        showUser(user);
        return;
    } catch (error) {
        if (error.status !== 401) {
            $("#auth-message").text("Не вдалося перевірити вхід.");
            return;
        }
    }

    try {
        await refreshAccessToken();
        const user = await sendAuthorizedRequest("/users/me", "GET");
        showUser(user);
    } catch (error) {
        if (error.status === 400 || error.status === 401) {
            clearTokens();
        } else {
            $("#auth-message").text("Не вдалося перевірити вхід.");
        }
    }
}

loadNavigation();