$("#logout-button").on("click", logout);

async function loadProfile() {
    const access = localStorage.getItem("access_token");
    const refresh = localStorage.getItem("refresh_token");

    if (!access && !refresh) {
        redirectToLogin();
        return;
    }

    try {
        const user = await authRequest("/users/me");

        $("#username").text(user.username);
        $("#first-name").text(user.first_name || "—");
        $("#last-name").text(user.last_name || "—");
        $("#email").text(user.email);

        $("#user-name").text(user.first_name || user.username);
        $("#logout-button").prop("hidden", false);
        $("#profile").prop("hidden", false);
        $("#message").text("");
    } catch (error) {
        $("#message").text(
            "Не вдалося завантажити профіль. Спробуйте оновити сторінку."
        );
    }
}

loadProfile();