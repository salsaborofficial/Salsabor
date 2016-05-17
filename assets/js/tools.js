/*
Le fichier tools.js contient toutes les fonctions javascript qui peuvent être utilisés par plusieurs fichiers,
qu'elles soient les fonctions de notification, ou des fonctions plus utilitaires.
Dès que le document est prêt, tous les modaux et les fonctions qui doivent tourner de façon constantes sont lancées ici.
*/

$(document).ready(function(){
	jQuery.expr[':'].regex = function(elem, index, match) {
		var matchParams = match[3].split(','),
			validLabels = /^(data|css):/,
			attr = {
				method: matchParams[0].match(validLabels) ?
				matchParams[0].split(':')[0] : 'attr',
				property: matchParams.shift().replace(validLabels,'')
			},
			regexFlags = 'ig',
			regex = new RegExp(matchParams.join('').replace(/^s+|s+$/g,''), regexFlags);
		return regex.test(jQuery(elem)[attr.method](attr.property));
	}

	var firstCount = 0; // Pour éviter la notification dès le rafraîchissement de la page.
	window.numberProduits = 1; // Articles dans le panier
	notifCoursParticipants(firstCount);
	notifEcheancesDues(firstCount);
	notifPanier();
	setInterval(notifCoursParticipants, 30000);
	setInterval(notifEcheancesDues, 30000);
	badgeNotifications();
	badgeTasks();
	$('[data-toggle="tooltip"]').tooltip();
	moment.locale("fra");

	// If we're on one of the user pages, then we have to fetch and refresh details of the user banner.
	var re = /user/i;
	if(re.exec(top.location.pathname) != null){
		re = /([0-9]+)/;
		var user_id = re.exec(top.location.pathname);
		refreshUserBanner(user_id[0]);
	}

	// Démarre l'horloge
	tickClock();
	setInterval(tickClock, 1000);

	// Construit le tableau d'inputs obligatoires par formulaire
	var mandatories = [];
	$(".mandatory").each(function(){
		$(this).prev("label").append(" <span class='span-mandatory' title='Ce champ est obligatoire'>*</span>");
		var inputName = $(this).attr('name');
		mandatories.push(inputName);
		$(this).parent().addClass('has-feedback');
		$(this).parent().append("<span class='glyphicon form-control-feedback'></span>");
		if($(this).html() != '' || $(this).val() != ''){
			$(this).parent().addClass('has-success');
			$(this).next("span").addClass('glyphicon-ok');
		}
	}).on('focus keyup change blur', function(){
		if($(this).html() != '' || $(this).val() != ''){
			$(this).parent().removeClass('has-error');
			$(this).parent().addClass('has-success');
			$(this).next("span").removeClass('glyphicon-remove');
			$(this).next("span").addClass('glyphicon-ok');
		} else {
			$(this).parent().removeClass('has-success');
			$(this).parent().addClass('has-error');
			$(this).next("span").removeClass('glyphicon-ok');
			$(this).next("span").addClass('glyphicon-remove');
		}
		var j = 0;
		for(var i = 0; i < mandatories.length; i++){
			if($("[name="+mandatories[i]+"]").val() != '' || $("[name="+mandatories[i]+"]").html() != ''){
				j++; // Incrémente le compteur d'input remplis et vide les éventuels messages d'erreurs indiquant que le champ est obligatoire
				$(this).next().children('p').empty();
			} else {
				// Affiche un message indiquant que le champ est obligatoire
				$(this).next().children('p').html("Ce champ est requis");
			}
		}
		// Si tous les inputs sont remplis, alors on autorise la soumission du formulaire
		if(j == mandatories.length){
			$("#submit-button").prop('disabled', false);
			$(".submit-button").prop('disabled', false);
		} else {
			$("#submit-button").prop('disabled', true);
			$(".submit-button").prop('disabled', false);
		}
	});

	// Editables
	$(".editable").each(function(){
		var editIcon = "<span class='glyphicon glyphicon-edit' style='display:none; float:right;'></span>";
		$(this).after(editIcon);
	});

	// Filtre dynamique
	var $rows = $('#filter-enabled tr');
	$('#search').keyup(function(){
		var val = $.trim($(this).val()).replace(/ +/g, ' ').toLowerCase();
		$rows.show().filter(function(){
			var text = $(this).text().replace(/\s+/g, ' ').toLowerCase();
			return !~text.indexOf(val);
		}).hide();
	});

	// Vérification de l'existence d'un utilisateur dans la base
	$(".has-check").on('blur keyup focus',function(){
		var field = $(this);
		var identite = $(this).val();
		var token = $(this).attr('name').substr(12);
		$.post("functions/check_adherent.php", {identite : identite}).done(function(data){
			if(data == 0){
				if($(":regex(id,^unknown-user)").length == 0){
					var addOptions = "<div id='unknown-user"+token+"'>";
					addOptions += "<p>Aucun résultat. Voulez vous inscrire cet adhérent ?</p>";
					addOptions += "<a href='#user-details"+token+"' role='button' class='btn btn-info btn-block' value='create-user' id='create-user"+token+"' data-toggle='collapse' aria-expanded='false' aria-controls='userDetails'>Ouvrir le formulaire de création</a>";
					addOptions += "<div id='user-details"+token+"' class='collapse'>";
					addOptions += "<div class='well'>";
					addOptions += "<div class='row'>";
					addOptions += "<div class='col-lg-6'>";
					addOptions += "<div class='form-group'>";
					addOptions += "<label class='control-label'>Prénom</label><input type='text' name='identite_prenom' id='identite_prenom' class='form-control input-lg' placeholder='Prénom'>";
					addOptions += "</div>"; /*form-group*/
					addOptions += "</div>"; /*col-lg-6*/
					addOptions += "<div class='col-lg-6'>";
					addOptions += "<div class='form-group'>";
					addOptions += "<label class='control-label'>Nom</label><input type='text' name='identite_nom' id='identite_nom' class='form-control input-lg' placeholder='Nom'>";
					addOptions += "</div>"; /*form-group*/
					addOptions += "</div>"; /*col-lg-6*/
					addOptions += "</div>"; /*row*/
					addOptions += "<div class='row'>";
					addOptions += "<div class='col-lg-6'>";
					addOptions += "<div class='form-group'>";
					addOptions += "<label class='control-label'>Adresse postale</label><input type='text' name='rue' id='rue' placeholder='Adresse' class='form-control input-lg'>";
					addOptions += "</div>"; /*form-group*/
					addOptions += "</div>" /*col-lg-6*/
					addOptions += "<div class='col-lg-3'>";
					addOptions += "<div class='form-group'>";
					addOptions += "<label class='control-label'>Code postal</label><input type='number' name='code_postal' id='code_postal' placeholder='Code Postal' class='form-control input-lg'>";
					addOptions += "</div>"; /*form-group*/
					addOptions += "</div>"; /*col-lg-3*/
					addOptions += "<div class='col-lg-3'>";
					addOptions += "<div class='form-group'>";
					addOptions += "<label class='control-label'>Ville</label><input type='text' name='ville' id='ville' placeholder='Ville' class='form-control input-lg'>";
					addOptions += "</div>"; /*form-group*/
					addOptions += "</div>"; /*col-lg-6*/
					addOptions += "</div>"; /*row*/
					addOptions += "<div class='row'>";
					addOptions += "<div class='col-lg-6'>";
					addOptions += "<div class='form-group'>";
					addOptions += "<label for='text' class='control-label'>Adresse mail</label><input type='email' name='mail' id='mail' placeholder='Adresse mail' class='form-control input-lg'>";
					addOptions += "</div>"; /*form-group*/
					addOptions += "</div>"; /*col-lg-6*/
					addOptions += "<div class='col-lg-6'>";
					addOptions += "<div class='form-group'>";
					addOptions += "<label for='telephone' class='control-label'>Numéro de téléphone</label><input type='tel' name='telephone' id='telephone' placeholder='Numéro de téléphone' class='form-control input-lg'>";
					addOptions += "</div>"; /*form-group*/
					addOptions += "</div>"; /*col-lg-6*/
					addOptions += "</div>"; /*row*/
					addOptions += "<a class='btn btn-primary btn-block' onClick='addAdherent()'>Inscrire l'adhérent</a>";
					addOptions += "</div>"; /*well*/
					addOptions += "</div>"; /*collapse*/
					addOptions += "</div>"; /*unknown-user*/
					field.after(addOptions);
				}
			} else {
				$(":regex(id,^unknown-user)").remove();
				$(".has-name-completion:not(.completed)").val(identite);
			}
		})
	})

	$('.separate-scroll').on('DOMMouseScroll mousewheel', function(ev) {
		var $this = $(this),
			scrollTop = this.scrollTop,
			scrollHeight = this.scrollHeight,
			height = $this.height(),
			delta = (ev.type == 'DOMMouseScroll' ?
					 ev.originalEvent.detail * -40 :
					 ev.originalEvent.wheelDelta),
			up = delta > 0;

		var prevent = function() {
			ev.stopPropagation();
			ev.preventDefault();
			ev.returnValue = false;
			return false;
		}

		if (!up && -delta > scrollHeight - height - scrollTop) {
			// Scrolling down, but this will take us past the bottom.
			$this.scrollTop(scrollHeight);
			return prevent();
		} else if (up && delta > scrollTop) {
			// Scrolling up, but this will take us past the top.
			$this.scrollTop(0);
			return prevent();
		}
	});
}).on('click', '.editable', function(){
	var methods = [
		"Carte bancaire",
		"Chèque n°",
		"Espèces",
		"Virement compte à compte",
		"Chèques vacances",
		"En attente"
	];
	// Dès le clic, on récupère la valeur initiale du champ (peu importe le type de champ)
	var initialValue = $(this).val();
	if(initialValue == ""){initialValue = $(this).html();}
	console.log(initialValue);

	// On récupère ensuite l'id du champ modifié
	var token = $(this).attr('id');

	// Si la valeur correspond à une date, alors l'action de modification sera différente
	if(initialValue.indexOf('/') != -1){
		var initialDay = initialValue.substr(0,2);
		var initialMonth = initialValue.substr(3,2);
		var initialYear = initialValue.substr(6,4);
		var initialDate = moment(new Date(initialYear+'-'+initialMonth+'-'+initialDay)).format("YYYY-MM-DD");
		$(this).replaceWith("<input type='date' class='form-control editing' id='"+token+"' value="+initialDate+">");
	} else {
		$(this).replaceWith("<input type='text' class='form-control editing' id='"+token+"' value="+initialValue+">");
	}
	$(".editing").focus();
	$(":regex(id,^methode_paiement)").autocomplete({
		source: methods
	})
	$(".editing").blur(function(){
		var editedValue = $(this).val();
		if(editedValue != "" && editedValue != initialValue){
			if(editedValue.indexOf('-') != -1){
				var editedDate = moment(new Date(editedValue)).format("DD/MM/YYYY");
				$(this).replaceWith("<span class='editable' id='"+token+"'>"+editedDate+"</span>");
			} else {
				$(this).replaceWith("<span class='editable' id='"+token+"'>"+editedValue+"</span>");
			}
			uploadChanges(token, editedValue);
		} else {
			$(this).replaceWith("<span class='editable' id='"+token+"'>"+initialValue+"</span>");
		}
	});
}).on('mouseenter', '.editable', function(){
	$(this).next().show();
}).on('mouseleave blur', '.editable', function(){
	$(this).next().hide();
}).delegate('*[data-toggle="lightbox"]', 'click', function(event) {
	event.preventDefault();
	return $(this).ekkoLightbox({
		onNavigate: false
	});
}).on('click', '.submit-relay', function(){
	$(".submit-relay-target").click();
}).on('click', '.sub-modal-close', function(){
	$(".sub-modal").toggle();
}).on('click', '.trigger-sub', function(e){
	e.stopPropagation();
	$(".sub-modal").hide(0);
	$(".sub-modal-body").empty();
	var target = document.getElementById($(this).attr("id"));
	var tpos = $(this).position(), type = target.dataset.subtype, toffset = $(this).offset();
	/*console.log(product_id, type);*/

	var title, body = "", footer = "";
	switch(type){
		case 'AREP':
			var product_id = target.dataset.argument;
			title = "Prolonger";
			body += "<input type='text' class='form-control datepicker'/>";
			footer += "<button class='btn btn-success extend-product' data-argument='"+product_id+"' id='btn-sm-extend'>Prolonger</button>";
			if(moment(target.dataset.arep).isValid()){
				footer += "<button class='btn btn-danger remove-extension' data-argument='"+product_id+"' id='btn-sm-unextend'>Annuler AREP</button>";
			}
			$(".sub-modal").css({top : tpos.top+51+'px'});
			$(".sub-modal-body").html(body);
			break;

		case 'activate':
			var product_id = target.dataset.argument;
			title = "Activer";
			body += "<input type='text' class='form-control datepicker'/>";
			footer += "<button class='btn btn-success activate-product' data-argument='"+product_id+"' id='btn-sm-activate'>Activer</button>";
			$(".sub-modal").css({top : tpos.top+51+'px'});
			$(".sub-modal-body").html(body);
			break;

		case 'deadline':
			var task_id = target.dataset.task;
			title = "Date limite";
			body += "<input type='text' class='form-control datepicker'/>";
			footer += "<button class='btn btn-success task-deadline' data-task='"+task_id+"' id='btn-set-deadline'>Définir</button>";
			$(".sub-modal").css({top : toffset.top+25+'px', left : toffset.left+15+'px'});
			$(".sub-modal-body").html(body);
			break;

		case 'set-participation-product':
			title = "Changer le produit à utiliser";
			var participation_id = target.dataset.participation;
			console.log(participation_id);
			$.when(fetchEligibleProducts(participation_id)).done(function(data){
				var construct = displayEligibleProducts(data);
				$(".sub-modal-body").html(construct);
			})
			footer += "<button class='btn btn-success set-participation-product' id='btn-set-participation-product' data-participation='"+participation_id+"'>Reporter</button>";
			footer += " <button class='btn btn-default btn-modal set-participation-product' id='btn-product-null-record' data-participation='"+participation_id+"'><span class='glyphicon glyphicon-link'></span> Retirer</button>";
			$(".sub-modal").css({top : toffset.top+'px'});
			if(toffset.left > 1000){
				$(".sub-modal").css({left : toffset.left-350+'px'});
			} else {
				$(".sub-modal").css({left : toffset.left+20+'px'});
			}
			break;

		case 'change-participation':
			title = "Changer le cours associé";
			var participation_id = target.dataset.argument;
			$.when(fetchEligibleSessions(participation_id)).done(function(data){
				console.log(data);
				var construct = displayTargetSessions(data);
				$(".sub-modal-body").html(construct);
			})
			footer += "<button class='btn btn-success report-participation' id='btn-session-changer-record' data-participation='"+participation_id+"'>Changer</button>";
			$(".sub-modal").css({top : toffset.top+'px'});
			if(toffset.left > 1000){
				$(".sub-modal").css({left : toffset.left-350+'px'});
			} else {
				$(".sub-modal").css({left : toffset.left+20+'px'});
			}
			break;

		case 'delete':
			title = "Supprimer une participation";
			var participation_id = target.dataset.argument;
			body += "Êtes-vous sûr de vouloir supprimer cette participation ?";
			$(".sub-modal-body").html(body);
			footer += "<button class='btn btn-danger delete-participation col-lg-6' id='btn-product-delete' data-session='"+participation_id+"'><span class='glyphicon glyphicon-trash'></span> Supprimer</button><button class='btn btn-default col-lg-6'>Annuler</button>";
			$(".sub-modal").css({top : tpos.top-45+'px'});
			break;

		case 'delete-record':
			title = "Supprimer un passage";
			var participation_id = target.dataset.argument;
			body += "Êtes-vous sûr de vouloir supprimer ce passage ?";
			$(".sub-modal-body").html(body);
			footer += "<button class='btn btn-danger delete-record col-lg-6' id='btn-record-delete' data-participation='"+participation_id+"'><span class='glyphicon glyphicon-trash'></span> Supprimer</button><button class='btn btn-default col-lg-6'>Annuler</button>";
			$(".sub-modal").css({top : toffset.top+'px'});
			if(toffset.left > 1000){
				$(".sub-modal").css({left : toffset.left-350+'px'});
			} else {
				$(".sub-modal").css({left : toffset.left+20+'px'});
			}
			break;

		case 'delete-product':
			title = "Supprimer un produit";
			var product_id = target.dataset.product;
			body += "ATTENTION : Si ce produit est seul dans une transaction, la transaction sera supprimée avec ce produit. Une fois validée, cette opération destructrice est irréversible. Êtes-vous sûr de vouloir supprimer ce produit ?";
			footer += "<button class='btn btn-danger delete-product col-lg-6' id='btn-product-delete' data-product='"+product_id+"' data-dismiss='modal'><span class='glyphicon glyphicon-trash'></span> Supprimer</button><button class='btn btn-default col-lg-6'>Annuler</button>";
			$(".sub-modal").css({top : tpos.top+51+'px'});
			$(".sub-modal-body").html(body);
			break;

		case 'delete-task':
			title = "Supprimer une tâche";
			var task_id = target.dataset.target;
			body += "ATTENTION : Cette opération est irréversible. Êtes-vous sûr(e) de vouloir continuer ?";
			footer += "<button class='btn btn-danger delete-task col-lg-6' id='btn-task-delete' data-task='"+task_id+"' data-dismiss='modal'><span class='glyphicon glyphicon-trash'></span> Supprimer</button><button class='btn btn-default col-lg-6'>Annuler</button>";
			$(".sub-modal").css({top : toffset.top+20+'px', left : toffset.left-321+'px'});
			$(".sub-modal-body").html(body);
			break;

		case 'add-record':
			title = "Ajouter un passage manuellement";
			var session_id = target.dataset.session;
			body += "<input type='text' class='form-control name-input'>";
			$(".sub-modal-body").html(body);
			footer += "<button class='btn btn-success add-record col-lg-6' id='btn-add-record' data-session='"+session_id+"'><span class='glyphicon glyphicon-plus'></span> Ajouter </button><button class='btn btn-default col-lg-6'>Annuler</button>";
			$(".sub-modal").css({top : toffset.top+'px'});
			if(toffset.left > 1000){
				$(".sub-modal").css({left : toffset.left-350+'px'});
			} else {
				$(".sub-modal").css({left : toffset.left+20+'px'});
			}
			break;

		case 'unlink':
			title = "Délier une participation";
			var participation_id = target.dataset.argument;
			body += "Êtes vous sûr de vouloir délier cette participation ? Vous la retrouverez dans les passages non régularisés";
			$(".sub-modal-body").html(body);
			footer += "<button class='btn btn-default unlink-session col-lg-6' id='btn-product-unlink' data-session='"+participation_id+"'><span class='glyphicon glyphicon-link'></span> Délier</button> <button class='btn btn-default col-lg-6'>Annuler</button>";
			$(".sub-modal").css({top : tpos.top-45+'px'});
			break;

		case 'reception-maturity':
			var maturity_id = target.dataset.maturity;
			title = "Réception de l'échéance";
			body += "<input type='text' class='form-control datepicker'/>";
			body += "<label class='control-label'>Méthode de paiement</label>";
			body += "<input type='text' class='form-control reception-method'></input>";
			footer += "<button class='btn btn-success receive-maturity' data-maturity='"+maturity_id+"' id='btn-sm-receive'>Recevoir</button>";
			$(".sub-modal").css({top : tpos.top+51+'px'});
			$(".sub-modal-body").html(body);
			break;

		case 'bank-maturity':
			var maturity_id = target.dataset.maturity;
			title = "Encaissement de l'échéance";
			body += "<input type='text' class='form-control datepicker'/>";
			footer += "<button class='btn btn-success bank-maturity' data-maturity='"+maturity_id+"' id='btn-sm-receive'>Recevoir</button>";
			$(".sub-modal").css({top : tpos.top+51+'px'});
			$(".sub-modal-body").html(body);
			break;

		default:
			title = "Sub modal";
			break;
	}
	$(".sub-modal-title").text(title);
	$(".sub-modal-footer").html(footer);
	$(".datepicker").datetimepicker({
		format: "DD/MM/YYYY",
		inline: true,
		locale: "fr"
	})
	var re = /historique/i;
	if(re.exec(top.location.pathname) != null){
		console.log("Historique");
		$(".sub-modal").css({left: 74+'%'});
	}
	$(".sub-modal").show(0);
})

$(".has-name-completion").on('click blur keyup', function(){
	if($(this).val() != ""){
		$(this).addClass("completed");
	} else {
		$(this).removeClass("completed");
	}
})

// Surveille les participations à un cours non associés à un produit (abonnement, vente spontanée, invitation...)
function notifCoursParticipants(firstCount){
	$.post("functions/watch_participations.php").done(function(data){
		if(data == 0){
			$("#badge-participants").hide();
		} else {
			if(data > $("#badge-participations").html() && firstCount != 0){
				$.notify("Nouvelles participations non associées.", {globalPosition: "bottom right", className:"info"});
			}
			$("#badge-participations").show();
			$("#badge-participations").html(data);
			$(".irregular-participations-title>span").text(data);
		}
	})
}

// Surveille le nombre d'échéances qui ne sont pas réglées après leur date
function notifEcheancesDues(firstCount){
	$.post("functions/watch_maturities.php").done(function(data){
		if(data == 0){
			$("#badge-echeances").hide();
		} else {
			if(data > $("#badge-echeances").html() && firstCount != 0){
				$.notify("De nouvelles échéances ont dépassé leur date.", {globalPosition: "bottom right", className:"info"});
			}
			$("#badge-echeances").show();
			$("#badge-echeances").html(data);
		}
	})
}

function badgeTasks(){
	$.post("functions/watch_tasks.php").done(function(data){
		if(data == 0){
			$("#badge-tasks").hide();
		} else {
			$("#badge-tasks").show();
			$("#badge-tasks").html(data);
		}
		setTimeout(badgeTasks, 10000);
	})
}

function showSuccessNotif(data){
	$.notify(data, {globalPosition:"right bottom", className:"success"});
}

// FONCTIONS UTILITAIRES //
// Insert la date d'aujourd'hui dans un input de type date supportant la fonctionnalité
$("*[date-today='true']").click(function(){
	var today = new moment().format("YYYY-MM-DD");
	$(this).parent().prev().val(today);
	$(this).parent().prev().blur();
});

// Vérifie si un adhérent a des échéances impayées lors de la vente d'un forfait
function checkMaturities(data){
	$.post('functions/check_unpaid.php', {search_id : data}).done(function(maturities){
		if(maturities != 0){
			$('#err_adherent').empty();
			$('#unpaid').show();
			$("#maturities-checked").hide();
		} else {
			$('#err_adherent').empty();
			$('#unpaid').hide();
			$("#maturities-checked").show();
		}
	})
}

// Effectue une inscription rapide dans le cas d'un adhérent inexistant à la réservation d'une salle ou l'achat d'un forfait
function addAdherent(){
	var identite_prenom = $('#identite_prenom').val();
	var identite_nom = $('#identite_nom').val();
	var rfid = $("[name='rfid']").val();
	var rue = $('#rue').val();
	var code_postal = $('#code_postal').val();
	var ville = $('#ville').val();
	var mail = $('#mail').val();
	var telephone = $('#telephone').val();
	var date_naissance = $('#date_naissance').val();
	$.post("functions/add_adherent.php", {identite_prenom : identite_prenom, identite_nom : identite_nom, rfid : rfid, rue : rue, code_postal : code_postal, ville : ville, mail : mail, telephone : telephone, date_naissance : date_naissance}).done(function(data){
		console.log(data);
		var parse = JSON.parse(data);
		$(".has-name-completion:not(.completed)").val(identite_prenom+" "+identite_nom);
		if(window.miniCart != ""){
			window.miniCart["id_beneficiaire"] = parse["id"];
			window.miniCart["nom_beneficiaire"] = identite_prenom+" "+identite_nom;
		}
		showSuccessNotif(parse["success"]);
		$(":regex(id,^unknown-user)").hide('500');
	});
}

// Vérifie l'existence de jours chômés à l'ajout d'un évènement
function checkHoliday(){
	var date_debut = $('#date_debut').val();
	$.post("functions/check_holiday.php", {date_debut : date_debut}).done(function(data){
		console.log(data);
		if(data != "0"){
			$("#holiday-alert").empty();
			$("#holiday-alert").append("Ce jour est chômé. Impossible d'ajouter une réservation à cette date.");
			$('.confirm-add').prop('disabled', true);
		} else {
			$('#holiday-alert').empty();
			$('.confirm-add').prop('disabled', false);
			checkCalendar(true, false);
		}
	});
}

// Afficher et met à jour l'horloge
function tickClock(){
	var now = moment().locale('fr').format("DD MMMM YYYY HH:mm:ss");
	$("#current-time").html(now);
	$(".panel").each(function(){
		$(this).find(".cours-count").html($(this).find(".list-group-item").length);
		$(this).find(".cours-count-checked").html($(this).find(".list-group-item-success").length);
	})
}

// Affiche en direct le nombre d'éléments dans le panier
function notifPanier(){
	if(sessionStorage.getItem("panier") != null){
		var cartSize = JSON.parse(sessionStorage.getItem("panier"));
		if(cartSize.length == 0){
			$("#badge-panier").hide();
			$(".table-panier").empty();
		} else {
			$("#badge-panier").show();
			$("#badge-panier").html(cartSize.length);
			fillShoppingCart();
		}
	}
}

// Remplit le popover de l'icône panier dans la navigation
function fillShoppingCart(){
	$(".table-panier").empty();
	if(sessionStorage.getItem("panier") != null){
		var cart = JSON.parse(sessionStorage.getItem("panier"));
		var cartSize = JSON.parse(sessionStorage.getItem("panier-noms"));
		var line = "";
		for(var i = 0; i < cartSize.length; i++){
			line += "<tr>"
			line += "<td class='col-lg-11'>"+cartSize[i]+"</td>";
			line += "<td class='col-lg-1'><span class='glyphicon glyphicon-trash' onclick='removeCartElement("+i+")'></span></td>";
			line += "<tr>";
		}
		$(".table-panier").append(line);
		composeURL(cart[0]);
	}
}

function removeCartElement(key){
	var cart = JSON.parse(sessionStorage.getItem("panier"));
	var cartNames = JSON.parse(sessionStorage.getItem("panier-noms"));
	cart.splice(key, 1);
	cartNames.splice(key, 1);
	sessionStorage.setItem("panier", JSON.stringify(cart));
	sessionStorage.setItem("panier-noms", JSON.stringify(cartNames));
	notifPanier();
}

// Compose les URL lors de l'achat
function composeURL(token){
	var url = "personnalisation.php?element=";
	url += token;
	url += "&order=0";
	$("[name='next']").attr('href', url);
	$("[name='previous']").attr('href', url);
}

function updateFlag(table, flag, value, target){
	return $.post("functions/update_flag.php", {table : table, flag : flag, value : value, target_id : target});
}

function toggleBoolean(button, boolean_name, value_id, value_name, old_value){
	var data = {
		"boolean_name": boolean_name,
		"old_value": old_value
	};
	data[value_name] = value_id;
	console.log(data);
	$.post("functions/set_boolean.php", {data : data}).done(function(data){
		console.log(data);
		if(button != null){
			if(old_value == 0){ // Then the new value is 1.
				button.removeClass("status-disabled");
				button.addClass("status-enabled");
				button.children("span").removeClass("glyphicon-floppy-remove");
				button.children("span").addClass("glyphicon-lock");
				document.getElementById(button.attr("id")).dataset.boolean = 1;
				if(button.attr("id") == "lock_status"){
					$("#manual-expire").removeClass("disabled");
					$("#manual-expire").addClass("enabled");
				}
				switch(button.attr("id")){
					case "lock_montant":
						button.attr("title", "Verrouillé : le montant de l'échéance ne variera pas, peu importe les autres échéances de la transaction.");
						break;

					case "lock_status":
						button.attr("title", "Verrouillé : le système n'a désormais pas l'autorisation de changer l'état (en attente, valide, expiré) du produit. Vous pouvez cependant toujours le modifier.");
						break;

					case "lock_dates":
						button.attr("title", "Verrouilé : le système n'a désormais pas l'autorisation de changer les dates de validité, d'activation ni d'expiration du produit. Vous pouvez néanmoins fixer toutes ces dates.");
						break;

					default:
						break;
				}
			} else {
				button.removeClass("status-enabled");
				button.addClass("status-disabled");
				button.children("span").removeClass("glyphicon-lock");
				button.children("span").addClass("glyphicon-floppy-remove");
				if(data[value_name] == "product_id"){
					computeRemainingHours(value_id, true);
				}
				document.getElementById(button.attr("id")).dataset.boolean = 0;
				if(button.attr("id") == "lock_status"){
					$("#manual-expire").removeClass("enabled");
					$("#manual-expire").addClass("disabled");
				}
				switch(button.attr("id")){
					case "lock_montant":
						button.attr("title", "Non verrouillé : le montant de l'échéance sera affecté par des changements dans d'autres échéances");
						break;

					case "lock_status":
						button.attr("title", "Libre : le système modifiera l'état du produit de façon appropriée en fonction des dates de validité.");
						break;

					case "lock_dates":
						button.attr("title", "Libre : le système modifiera les dates en fonction du premier cours enregistré, de la validité du produit et d'une potentielle extension de validité.");
						break;

					default:
						break;
				}
			}
		}
	})
}

function refreshUserBanner(user_id){
	$.get("functions/fetch_user_banner_details.php", {user_id : user_id}).done(function(data){
		var user_details = JSON.parse(data);
		console.log(user_details);
		$("#refresh-mail").html("<span class='glyphicon glyphicon-envelope'></span> "+user_details.mail);
		$("#refresh-rfid").html("<span class='glyphicon glyphicon-barcode'></span> "+user_details.user_rfid);
		//$("#refresh-tasks").append(user_details.tasks);
		$("#refresh-phone").html("<span class='glyphicon glyphicon-earphone'></span> "+user_details.telephone);
		$("#refresh-address").html("<span class='glyphicon glyphicon-home'></span> "+user_details.address);
	})
	setTimeout(refreshUserBanner, 10000, user_id);
}

// Deletes an entry in a table of the database
function deleteEntry(table, entry_id){
	return $.post("functions/delete_entry.php", {table : table, entry_id : entry_id});
}
