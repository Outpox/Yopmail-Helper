var domain = "yopmail.com";

var Mail = function () {
	this.name = randomMail();
	this.adresse = this.name + "@" + domain;
	this.created = Date();
	this.lastUsed = null;
	this.id = mailList.counter++;
	this.usageCount = 0;
	mailList.addMail(this);
	mailList.saveAndSync();
};

var MailList = function(counter) {
	this.counter = (typeof counter === 'undefined') ? 0 : counter;
	this.content = [];
}

var mailList = new MailList(10);

function getMail(id) {
	for (var i = 0; i < mailList.length; i++) {
		if (mailList[i].id = id)
			return mailList[i];
	};
	return null;
}

MailList.prototype.saveAndSync = function() {
	// chrome.storage.sync.set({"yh_mailList": mailList});
	chrome.storage.sync.set({"yh_mailList": this});
};
MailList.prototype.updateValues = function (newArray) {
	this.content = newArray;
};
MailList.prototype.load = function () {
	chrome.storage.sync.get("yh_mailList", function(data) {
		console.log(data);
		if (data.yh_mailList !== undefined) {
			this.content = data.yh_mailList.content;
			this.counter = data.yh_mailList.counter;
		}
	})
};
MailList.prototype.deleteMail = function(id) {
	for (var i = 0; i < this.content.length; i++) {
		if (this.content[i].id === id)
			this.content.splice(i, 1);
	};
	this.saveAndSync();
};
MailList.prototype.addMail = function(mail) {
	this.content.push(mail);
};

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
				break;
			case "getMailList":
				sendResponse({message: "OK", mailList: mailList.content});
				break;
			case "deleteMail":
				mailList.deleteMail(request.value);
				sendResponse({message: "OK", mailList: mailList.content});
				break;
		}
	}
);