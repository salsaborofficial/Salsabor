$("section#infos").hide();
$("section#tarifs").hide();
$("li[id$=-toggle]").css('cursor', 'pointer');
$("li[id$=-toggle]").click(function(){
    $("section").hide();
    $("li").attr('class', '');
    $(this).attr('class', 'active');
    var token = $(this).attr('id').replace("-toggle", "");
    $("#"+token).show();
});