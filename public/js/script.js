function signUp() {
    var email = $('#signup_email').val();
    var username = $('#signup_username').val();
    var password = $('#signup_password').val();
    var cf_password = $('#signup_confirm_password').val();
    var displayname = $('#signup_name').val();
    var notify = $('#signup_notify').val();
    if(!email){
        alert("Email empty!");
        return;
    }
    if(!password){
        alert("Password empty!");
        return;
    }
    if(!username){
        alert("Username empty!");
        return;
    }
    if(!displayname){
        alert("Name empty!");
        return;
    }
    if(password != cf_password){
        alert("Confirm password please");
        return;
    }
    if(!$('#signup_term').prop("checked")){
        alert("I have read and accept the term");
        return;
    }
    $.post("/api/signup",
        {
            email: email,
            username: username,
            password: password,
            displayname: displayname,
            notify: notify
        },
        function(data, status){
            console.log(data);
            if(!data.statusCode){
                alert(data.err);
            }else {
                window.location.href = "/messages";
            }
    });
}

