var baseUrl = "http://yopmail.com/en/";
var mailListDom = $("#mailList");

$(function(){
	translate();
	$("#generateButton").on("click", function() {
		chrome.runtime.sendMessage({action: "generateNewMail", value: ""}, function(response) {
			console.log(response);
			if (response.message === "OK") {
				copyText(response.mail.adresse);
				// addMailToDom(response.mail);
				loadMailList();
			}
		});
	});
});


var mailList = [];
loadMailList();
function loadMailList() {
	chrome.runtime.sendMessage({action: "getMailList", value: ""}, function(response) {
		console.log(response);
		if (response.message === "OK") {
			mailList = response.mailList;
			init();
		}
	});
}

function init() {
	mailListDom.empty();
	for (var i = 0; i < mailList.length; i++) {
		addMailToDom(mailList[i]);
	};
}

function addMailToDom(mail) {
	console.log("adding mail");
	console.log(mail);
	var tr = $("<tr id='mail" + mail.id + "'></tr>");
	var td1 = $("<td class='mdl-data-table__cell--non-numeric' style='text-align: center'></td>");
	var a1 = $("<a href='" + baseUrl + mail.name + "' target='_blank'>" + mail.adresse + "</a>");
	a1.on("click", function() {
		useMail(mail);
	});
	var lastUsed = mail.lastUsed === null ? chrome.i18n.getMessage('neverUsed') : new Date(mail.lastUsed);
	var lastUse = $("<td class='mdl-data-table__cell--non-numeric' style='text-align: center'>" + lastUsed.toLocaleString() + "</td>");
	var copy = $("<td class='mdl-data-table__cell--non-numeric' style='text-align: center'></td>");
	var a2 = $("<a href='#'><img width='24' height='24' title='' alt='' src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAABIAAAASABGyWs+AAAACXZwQWcAAAAYAAAAGAB4TKWmAAAAYElEQVRIx2NgoCPwYmBgeMTAwPCfREw0eEyG4SRZQLIGYgATtQ0kxQJy4uQRVB9RQURunDwm1gJy4gRDz4DGwagFoxaMFAtYkNiMQ9IHw9uCJ1Ca1OrzCQORgOoVDk0AAPQGWyAE8AECAAAAAElFTkSuQmCC'/></a>");
	a2.on("click", function() {
		useMail(mail);
		copyText(mail.adresse);
	});
	var del = $("<td class='mdl-data-table__cell--non-numeric' style='text-align: center'></td>");
	var a3 = $("<a href='#'><img width='24' height='24' title='' alt='' src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAABIAAAASABGyWs+AAAACXZwQWcAAAAYAAAAGAB4TKWmAAAAaElEQVRIx2NgGAUjFugwMDDsY2BgECVCrShUrQ4pFuxjYGD4z8DAcJmAJaJQNf+heogGyBpxWUKMGrItodhwfAZRzXBcllDVcGyWkGQ4E7VcMGiDiKaRTNNkSvOMRvOiguaF3SgYRgAA1bo+/as5g9sAAAAASUVORK5CYII='/></a>");
	a3.on("click", function() {
		$("#mail" + mail.id).remove();
		deleteMail(mail);
	});
	td1.append(a1);
	tr.append(td1);
	tr.append(lastUse);
	copy.append(a2);
	del.append(a3);
	tr.append(copy);
	tr.append(del);
	mailListDom.append(tr);
	translate();
}

function translate() {
	$('[data-resource]').each(function() {
		var el = $(this);
		var resourceName = el.data('resource');
		var resourceText = chrome.i18n.getMessage(resourceName);
		el.text(resourceText);
	});
}

function copyText(text) {
    var textField = document.getElementById("taCopy");
    textField.innerText = text;
    textField.select();
    document.execCommand('copy');
}

function useMail(mail) {
	mail.lastUsed = Date();
	mail.usageCount++;
	syncAndSave();
	init();
}

function deleteMail(mail) {
	chrome.runtime.sendMessage({action: "deleteMail", value: mail.id}, function(response) {
		if (response.message === "OK") {
			loadMailList();
			resizePopup();
		}
	});
}

function syncAndSave() {
	chrome.runtime.sendMessage({action: "updateMailList", value: mailList}, function(response) {});
}

function resizePopup() {
	$('html').height($('#main').height());
}