function comment(postid) {
    var content = $('#text-comment').val();
    if(!content){
        alert("Comment content empty");
        return;
    }
    $.get("/api/user", function(data, status){
        if(data.statusCode){
            $.post("/api/user/comments",
                {
                    postid: postid,
                    content: content
                },
                function(data, status){
                    if(data.statusCode){
                        location.reload();
                    }else{
                        alert("Comment fail");
                    }
                });
        }else {
            $.post("/api/anony/comments",
                {
                    postid: postid,
                    content: content
                },
                function(data, status){
                    if(data.statusCode){
                        location.reload();
                    }else{
                        alert("Comment fail");
                    }
                });
        }
    });
}