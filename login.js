function getNextPage() {
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");

    if (next) {
        try {
            const url = new URL(next, window.location.href);

            if (
                url.origin === window.location.origin &&
                !url.pathname.endsWith("/login.html") &&
                !url.pathname.endsWith("/register.html")
            ) {
                return url.pathname + url.search + url.hash;
            }
        } catch (error) {
            return "index.html";
        }
    }

    return "index.html";
}

async function checkLogin() {
    const access = localStorage.getItem("access_token");
    const refresh = localStorage.getItem("refresh_token");

    if (!access && !refresh) {
        return;
    }

    $("#login-form").prop("hidden", true);
    $("#message").text("Перевірка входу...");

    try {
        await sendAuthorizedRequest("/users/me", "GET");
    } catch (error) {
        if (error.status !== 401) {
            $("#message").text(
                "Не вдалося перевірити вхід. Оновіть сторінку."
            );
            return;
        }

        try {
            await refreshAccessToken();
            await sendAuthorizedRequest("/users/me", "GET");
        } catch (refreshError) {
            if (
                refreshError.status === 400 ||
                refreshError.status === 401
            ) {
                clearTokens();
                $("#login-form").prop("hidden", false);
                $("#message").text("");
            } else {
                $("#message").text(
                    "Не вдалося перевірити вхід. Оновіть сторінку."
                );
            }

            return;
        }
    }

    window.location.replace(getNextPage());
}

$("#login-form").on("submit", function (event) {
    event.preventDefault();

    const data = {
        username: $("#username").val(),
        password: $("#password").val()
    };

    const button = $(this).find('button[type="submit"]');
    button.prop("disabled", true);
    $("#message").text("Вхід...");

    $.ajax({
        url: API_URL + "/token/",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(data),

        success: function (response) {
            localStorage.setItem("access_token", response.access);
            localStorage.setItem("refresh_token", response.refresh);

            window.location.replace(getNextPage());
        },

        error: function (xhr) {
            if (xhr.status === 401) {
                $("#message").text(
                    "Неправильне ім’я користувача або пароль."
                );
            } else if (xhr.responseJSON) {
                $("#message").text(
                    JSON.stringify(xhr.responseJSON.errors || xhr.responseJSON)
                );
            } else {
                $("#message").text(
                    "Не вдалося виконати запит. Перевірте підключення до сервера."
                );
            }
        },

        complete: function () {
            button.prop("disabled", false);
        }
    });
});

checkLogin();