var BASE_URL    = "http://yopmail.com/en/",
    mailListDom = $("#mailList"),
    API_URL     = 'https://api.outpox.fr/yhs/';

$(function(){
	translate();
	var customInputButton = $("#manualAddress"),
		customaddressInput = $("#customAddressInput");

	$("#generateButton").on("click", function() {
		chrome.runtime.sendMessage({action: "generateNewMail", value: ""}, function(response) {
			if (response.message === "OK") {
				copyText(response.newMail.address);
				mailList = response.mailList;
				init();
			}
		});
	});
    customInputButton.on("click", function () {
        customInputButton.hide();
        customaddressInput.show().focus();
    });
    customaddressInput.on("blur", function () {
        customInputButton.show();
        customaddressInput.hide();
        customaddressInput.val("");
    });
    customaddressInput.keypress(function(e) {
        if(e.which == 13) {
            var address = customaddressInput.val();
            if (address.indexOf('@yopmail.com') == -1) {
                address += '@yopmail.com';
            }
            chrome.runtime.sendMessage({action: "generateNewMail", value: address}, function(response) {
                if (response.message === "OK") {
                    copyText(response.newMail.address);
                    loadMailList();
                }
            });
        }
    });
});


var mailList = [];
loadMailList();
function loadMailList() {
	chrome.runtime.sendMessage({action: "getMailList", value: ""}, function(response) {
		if (response.message === "OK") {
			mailList = response.mailList;
			init();
		}
	});
}

function init() {
	mailListDom.empty();
	for (var i = 0; i < mailList.content.length; i++) {
		addMailToDom(mailList.content[i]);
	}
}

function addMailToDom(mail) {
	var tr = $("<tr id='mail" + mail.id + "'></tr>");
	var td1 = $("<td class='mdl-data-table__cell--non-numeric' style='text-align: center'></td>");
	var a1 = $("<a href='" + BASE_URL + mail.name + "' target='_blank'>" + mail.address + "</a>");
	a1.on("click", function() {
		useMail(mail);
	});
	var mailCountId = 'loading_' + mail.id;
    var mailCount = $("<td style='text-align: center;'><img id='" + mailCountId + "' src='img/ajax-loader.gif' alt=''></td>");
    getMailCount(mail, function (apiResponse) {
        $("#" + mailCountId).remove();
        mailCount.append(apiResponse.mailCount);
    });
	var lastUsed = mail.lastUsed === null ? chrome.i18n.getMessage('neverUsed') : new Date(mail.lastUsed);
	var lastUse = $("<td class='mdl-data-table__cell--non-numeric' style='text-align: center'>" + lastUsed.toLocaleString() + "</td>");
	var copy = $("<td class='mdl-data-table__cell--non-numeric' style='text-align: center'></td>");
	var a2 = $("<a href='#'><img width='24' height='24' title='' alt='' src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAABIAAAASABGyWs+AAAACXZwQWcAAAAYAAAAGAB4TKWmAAAAYElEQVRIx2NgoCPwYmBgeMTAwPCfREw0eEyG4SRZQLIGYgATtQ0kxQJy4uQRVB9RQURunDwm1gJy4gRDz4DGwagFoxaMFAtYkNiMQ9IHw9uCJ1Ca1OrzCQORgOoVDk0AAPQGWyAE8AECAAAAAElFTkSuQmCC'/></a>");
	a2.on("click", function() {
		useMail(mail);
		copyText(mail.address);
	});
	var del = $("<td class='mdl-data-table__cell--non-numeric' style='text-align: center'></td>");
	var a3 = $("<a href='#'><img width='24' height='24' title='' alt='' src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAABIAAAASABGyWs+AAAACXZwQWcAAAAYAAAAGAB4TKWmAAAAaElEQVRIx2NgGAUjFugwMDDsY2BgECVCrShUrQ4pFuxjYGD4z8DAcJmAJaJQNf+heogGyBpxWUKMGrItodhwfAZRzXBcllDVcGyWkGQ4E7VcMGiDiKaRTNNkSvOMRvOiguaF3SgYRgAA1bo+/as5g9sAAAAASUVORK5CYII='/></a>");
	a3.on("click", function() {
		$("#mail" + mail.id).remove();
		deleteMail(mail);
	});
	td1.append(a1);
	tr.append(td1);
    tr.append(mailCount);
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
	mail.lastUsed = Date.now();
	mail.usageCount++;
    updateMail(mail);
	init();
}

function deleteMail(mail) {
	chrome.runtime.sendMessage({action: "deleteMail", value: mail}, function(response) {
        mailList = response.mailList;
        resizePopup();
	});
}

function updateMail(mail) {
	chrome.runtime.sendMessage({action: "updateMail", value: mail}, function (response) {
        mailList = response.mailList;
    });
}

function resizePopup() {
	$('html').height($('#main').height());
}

function getMailCount(mail, callback) {
    var url = API_URL + mail.name;
    fetch(url)
        .then(function (resp) {
            return resp.json();
        })
        .then(function (response) {
            callback(response);
        })
}