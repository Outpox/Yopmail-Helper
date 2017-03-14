var domain = "yopmail.com";

var Mail = function (customAddress) {
	this.name = customAddress ? customAddress : randomMail();
	this.address = customAddress ? customAddress : this.name + "@" + domain;
	this.created = Date.now();
	this.lastUsed = null;
	this.id = mailList.counter++;
	this.usageCount = 0;
	mailList.addMail(this);
};

var MailList = function(counter) {
	var self = this;
    chrome.storage.sync.get("yh_mailList", function(data) {
        if (data.yh_mailList) {
            self.content = data.yh_mailList.content;
            self.counter = data.yh_mailList.counter;
        } else {
			self.counter = counter ? counter : 0;
			self.content = [];
		}
    })
};

var mailList = new MailList();

function getMail(id) {
	for (var i = 0; i < mailList.length; i++) {
		if (mailList[i].id = id)
			return mailList[i];
	}
	return null;
}

MailList.prototype.saveAndSync = function() {
	chrome.storage.sync.set({"yh_mailList": this});
};
MailList.prototype.updateValues = function (newArray) {
	this.content = newArray;
	this.saveAndSync();
};
MailList.prototype.deleteMail = function(mail) {
	for (var i = 0; i < this.content.length; i++) {
		if (this.content[i].id === mail.id)
			this.content.splice(i, 1);
	}
	this.saveAndSync();
};
MailList.prototype.addMail = function(mail) {
	this.content.push(mail);
	this.saveAndSync();
};

MailList.prototype.updateMail = function (mail) {
    for (var i = 0; i < this.content.length; i++) {
        if (this.content[i].id === mail.id) {
            this.content[i] = mail;
        }
    }
    this.saveAndSync();
};

function randomMail() {
	return (Math.random()*1e32).toString(36);
}

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		switch(request.action) {
			case "generateNewMail":
				var newMail = new Mail(request.value);
				sendResponse({message: "OK", mailList: mailList, newMail: newMail});
				break;
			case "updateMail":
				mailList.updateMail(request.value);
				sendResponse({mailList: mailList});
				break;
            case "updateMailList":
				mailList.updateValues(request.value.content);
				mailList.saveAndSync();
				break;
			case "getMailList":
				sendResponse({message: "OK", mailList: mailList});
				break;
			case "deleteMail":
				mailList.deleteMail(request.value);
				sendResponse({mailList: mailList});
				break;
		}
	}
);