var domain = "yopmail.com";
var mailList = [];
mailList.counter = 10;

var Mail = function () {
	this.name = randomMail();
	this.adresse = this.name + "@" + domain;
	this.created = Date();
	this.lastUsed = null;
	this.id = mailList.counter++;
	this.usageCount = 0;
	mailList.push(this);
	mailList.saveAndSync();
};

function getMail(id) {
	for (var i = 0; i < mailList.length; i++) {
		if (mailList[i].id = id)
			return mailList[i];
	};
	return null;
}


mailList.saveAndSync = function() {
	// chrome.storage.sync.set({"yh_mailList": mailList});
	chrome.storage.local.set({"yh_mailList": mailList});
};
mailList.updateValues = function (newVal) {
	mailList.length = 0;
	for (var i = 0; i < newVal.length; i++) {
		mailList[i] = newVal[i];
	};
};
mailList.load = function () {
	chrome.storage.local.get("yh_mailList", function(data) {
		if (data.yh_mailList !== undefined) {
			mailList = data.yh_mailList;
		}
	})
};

mailList.load();

function randomMail() {
	return (Math.random()*1e32).toString(36);
}

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		switch(request.action) {
			case "generateNewMail":
				var responseMail = new Mail();
				sendResponse({message: "OK", mail: responseMail});
				break;
			case "updateMailList":
				mailList.updateValues(request.value);
				mailList.saveAndSync();
		}
	}
);