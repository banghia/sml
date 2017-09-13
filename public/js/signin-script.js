function signIn() {
    var account = $('#signin_account').val();
    var password = $('#signin_password').val();
    if(!account){
        alert("Account empty!");
        return;
    }
    if(!password){
        alert("Password empty!");
        return;
    }
    $.post("/api/signin",
        {
            account: account,
            password: password
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

$.get("/api/user", function(data, status){
        if(data.statusCode){
            window.location.href = "/";
        }
    });