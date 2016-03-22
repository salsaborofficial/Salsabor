$(document).ready(function(){
	// Init by display all the active sessions
	/* The goal here is to fetch all the active sessions when the page is loaded, then to wait 15 minutes before going to see if new sessions were activated. Thus, every 15 minutes we have to only get the newly activated sessions, which means the sessions that will begin in less than 90 minutes away from the time we're checking. As the sessions could have been added in a deorganised manner, we will construct an array of currently displayed sessions by ID to cross check what can be ignored by subsequent fetches.
	*/
	var fetched = [];
	displaySessions(fetched);
	moment.locale('fr');
})

function displaySessions(fetched){
	$.get("functions/fetch_active_sessions.php", {fetched : fetched}).done(function(data){
		var active_sessions = JSON.parse(data);
		var as_display = "";
		for(var i = 0; i < active_sessions.length; i++){
			var cours_start = moment(active_sessions[i].start);
			if(cours_start > moment()){
				var relative_time = cours_start.toNow();
			} else {
				var relative_time = cours_start.fromNow();
			}
			as_display += "<div class='panel panel-session' id='session-"+active_sessions[i].id+"'>";
			// Panel heading
			as_display += "<a class='panel-heading-container' onClick=fetchRecords('"+active_sessions[i].id+"')>";
			as_display += "<div class='panel-heading'>";
			// Container fluid for session name and hour
			as_display += "<div class='container-fluid'>";
			as_display += "<p class='session-id col-lg-4'>"+active_sessions[i].title+"</p>";
			as_display += "<p class='session-date col-lg-8'><span class='glyphicon glyphicon-time'></span> Le "+cours_start.format("DD/MM")+" de "+cours_start.format("H:m")+" à "+moment(active_sessions[i].end).format("H:m")+" (<span class='relative-start'>"+relative_time+"</span>)</p>";
			as_display += "</div>";
			// Container fluid for session level, teacher...
			as_display += "<div class='container-fluid'>";
			as_display += "<p class='col-lg-2 col-lg-offset-4'><span class='glyphicon glyphicon-signal'></span> "+active_sessions[i].level+"</p>";
			as_display += "<p class='col-lg-3'><span class='glyphicon glyphicon-pushpin'></span> "+active_sessions[i].room+"</p>";
			as_display += "<p class='col-lg-3'><span class='glyphicon glyphicon-blackboard'></span> "+active_sessions[i].teacher+"</p>";
			as_display += "</div>";

			as_display += "</div>";
			as_display += "</a>";
			// Panel body
			as_display += "<div class='panel-body collapse' id='body-session-"+active_sessions[i].id+"'>";
			as_display += "</div>";
			fetched.push(active_sessions[i].id);
		}
		$(".active-sessions-container").append(as_display);
		/*console.log(fetched);*/
		/*setTimeout(displaySessions, 5000, fetched);*/
		setTimeout(displaySessions, 900000, fetched);
	})
}

function fetchRecords(session_id){
	if($("#body-session-"+session_id).hasClass("in")){
		$("#body-session-"+session_id).collapse("hide");
		$("#body-session-"+session_id).empty();
	} else {
		$.get("functions/fetch_records_session.php", {session_id : session_id}).done(function(data){
			var records_list = JSON.parse(data);
			console.log(records_list);
			var contents = "<div class='row session-list-container' id='session-"+session_id+">";
			contents += "<ul class='records-inside-list records-product-list'>";
			for(var i = 0; i < records_list.length; i++){
				var record_status;
				switch(records_list[i].status){
					case '0':
						record_status = "record-default";
						break;

					case '2':
						record_status = "record-success";
						break;

					case '3':
						record_status = "record-danger";
						break;
				}
				contents += "<li class='session-record "+record_status+" container-fluid' id='session-record-"+records_list[i].id+"'>";
				contents += "<p class='col-lg-3 session-record-name'>"+records_list[i].user+"</p>";
				contents += "<p class='col-lg-3 session-record-name'>"+records_list[i].card+"</p>";
				contents += "<p class='col-lg-3 session-record-name'>"+moment(records_list[i].date).format("H:m:ss")+"</p>";
			}
			contents += "</ul>";
			contents += "</div>";
			$("#body-session-"+session_id).append(contents);
			$("#body-session-"+session_id).collapse("show");
		})
	}
}
