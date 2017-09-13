function post(username) {
    var content = $('#text-post').val();
    if(!content){
        alert("Post content empty");
        return;
    }
    $.get("/api/user", function(data, status){
        if(data.statusCode){
            $.post("/api/user/posts",
                {
                    account: username,
                    content: content
                },
                function(data, status){
                    if(data.statusCode){
                        location.href = "/post/rd_"+data.post.PRandom;
                        console.log(data);
                    }else{
                        alert("Post fail");
                    }
                });
        }else {
            $.post("/api/anony/post",
                {
                    account: username,
                    content: content
                },
                function(data, status){
                    if(data.statusCode){
                        location.href = "/post/rd_"+data.post.PRandom;
                        console.log(data);
                    }else{
                        alert("Post fail");
                    }
                });
        }
    });
}