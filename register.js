$("#register-form").on("submit", function (event) {
    event.preventDefault();

    const data = {
        username: $("#username").val(),
        first_name: $("#first_name").val(),
        last_name: $("#last_name").val(),
        email: $("#email").val(),
        password: $("#password").val(),
        confirmation: $("#confirmation").val()
    };

    const button = $(this).find('button[type="submit"]');
    button.prop("disabled", true);
    $("#message").text("Реєстрація...");

    $.ajax({
        url: "http://127.0.0.1:8000/api/v1/users",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(data),

        success: function () {
            $("#message").text(
                "Реєстрація успішна! Тепер можна увійти."
            );
            $("#register-form")[0].reset();
        },

        error: function (xhr) {
            if (xhr.responseJSON) {
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