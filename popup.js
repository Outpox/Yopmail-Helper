var baseUrl = "http://yopmail.com/en/";
var mailListDom = $("#mailList");

$(function(){
	translate();
	$("#generateButton").on("click", function() {
		chrome.runtime.sendMessage({action: "generateNewMail", value: ""}, function(response) {
			console.log(response);
			if (response.message === "OK") {
				addMailToDom(response.mail);
			}
		});
	});
});


var mailList = [];
chrome.storage.local.get("yh_mailList", function(data) {
	if (data.yh_mailList !== undefined) {
		mailList = data.yh_mailList;
	}
	init();
});

function init() {
	for (var i = 0; i < mailList.length; i++) {
		addMailToDom(mailList[i]);
	};
}

function addMailToDom(mail) {
	var tr = $("<tr></tr>");
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
	td1.append(a1);
	tr.append(td1);
	tr.append(lastUse);
	copy.append(a2);
	tr.append(copy);
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
    var textField = document.createElement('textarea');
    textField.innerText = text;
    textField.style.height = '0';
    textField.style.padding = '0';
    textField.style.margin = '0';
    textField.style.outline = '0';
    textField.style.float = 'left';
    textField.style.display = 'block';
    document.body.appendChild(textField);
    textField.select();
    document.execCommand('copy');
    textField.remove();
}

function useMail(mail) {
	console.log(mail);
	mail.lastUsed = Date();
	syncAndSave();
}

function syncAndSave() {
	chrome.runtime.sendMessage({action: "updateMailList", value: mailList}, function(response) {});
}