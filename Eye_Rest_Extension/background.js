var eyeRestMessage = "Take an Eye rest! > <";
var minutesRest = 20;

var reminders = [];
var expired = [];

setInterval(function() 
{
    reminders=[];
    expired=[];

    chrome.storage.local.get(null, function (items) 
    {
        if(items.uniqKey != undefined)
        {
            for(var i=0; i<items.uniqKey.length; i++)
            {
                reminders.push(items.uniqKey[i]);
            }
        }
        
        if(items.uniqKey2 != undefined)
        {
            for (var i=0; i<items.uniqKey2.length; i++)
            {
                expired.push(items.uniqKey2[i]);
            }
        }

        var need = true;
        for (var i = 0; i < reminders.length; i++)
        {
            if (reminders[i].msg == eyeRestMessage)
            {
                need = false;
            }
        }
        if (need == true)
        {
            var timeStamp = Date();

            var expDate = new Date();
            expDate.setTime(expDate.getTime() + minutesRest*60*1000);
            var expDateStr = String(new Date(expDate));
            reminders.push({msg: eyeRestMessage, date: timeStamp, expireDate: expDateStr, cmd: "normal"});
        }

        for(var i=0; i<reminders.length; i++)
        {
            if((Date.parse(Date()) - Date.parse(reminders[i].expireDate)) >= 0)
            {
                var removedVal = reminders.splice(i,1);
                if (removedVal[0].msg != eyeRestMessage)
                {
                    expired.push(removedVal[0]);
                }
                else
                {
                    var expDate = new Date(removedVal[0].expireDate);
                    expDate.setTime(expDate.getTime() + minutesRest*60*1000);
                    var expDateStr = String(new Date(expDate));

                    removedVal[0].expireDate = expDateStr;
                    reminders.push(removedVal[0]);
                }

                chrome.notifications.clear('reminder-notification')
                  
                  var notification = chrome.notifications.create(
                    'reminder-notification', {
                      type: 'basic',
                      iconUrl: 'notif-icon_white.png',

                      title: 'Your reminder!',
                      message: removedVal[0].msg
                    }, function () {} );

                alert(removedVal[0].msg);

                i--;
            }
        }

        var min;
        var tDiff;

        for(var i=0; i<reminders.length; i++)
        {
            min=i;
            for(var j=i+1;j<reminders.length;j++)
            {
                tDiff = (Date.parse(reminders[min].expireDate)-Date.parse(reminders[j].expireDate));
                if(tDiff>0)
                {
                    min=j;
                }
            }

            var tmp = reminders[min];
            reminders[min] = reminders[i];
            reminders[i] = tmp;
        }

        chrome.storage.local.set({uniqKey2: expired}, function () { });
        chrome.storage.local.set({uniqKey: reminders}, function () { });
        
        chrome.runtime.sendMessage({allReminders: reminders, expiredReminders: expired, cmd: "sendAll"}, function () { });

    });
}, 1000);

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) 
{
        if (request.cmd == "handshake" && request.msg == "handshake") 
        {
            reminders=[];
            expired=[];
            chrome.storage.local.get(null, function (items) 
            {
                if(items.uniqKey != undefined)
                {
                    for(var i=0; i<items.uniqKey.length; i++)
                    {
                        reminders.push(items.uniqKey[i]);
                    }
                }

                if(items.uniqKey2 != undefined)
                {
                    for (var i = 0; i < items.uniqKey2.length; i++) 
                    {
                        expired.push(items.uniqKey2[i]);
                    }
                }

                var min;
                var tDiff;

                for(var i=0; i<reminders.length; i++)
                {
                    min=i;
                    for(var j=i+1;j<reminders.length;j++){
                        tDiff = (Date.parse(reminders[min].expireDate)-Date.parse(reminders[j].expireDate));
                        if(tDiff>0)
                        {
                            min=j;
                        }
                    }

                    var tmp = reminders[min];
                    reminders[min] = reminders[i];
                    reminders[i] = tmp;
                }

                for(var i=0; i<reminders.length;i++)
                {
                    if((Date.parse(Date()) - Date.parse(reminders[i].expireDate)) >= 0)
                    {
                        var removedVal = reminders.splice(i,1);
                        if (removedVal[0].msg != eyeRestMessage)
                        {
                            expired.push(removedVal[0]);
                        }
                        else
                        {
                            var expDate = new Date(removedVal[0].expireDate);
                            expDate.setTime(expDate.getTime() + minutesRest*60*1000);
                            var expDateStr = String(new Date(expDate));

                            removedVal[0].expireDate = expDateStr;
                            reminders.push(removedVal[0]);
                        }

                        chrome.notifications.clear('reminder-notification')
                          
                          var notification = chrome.notifications.create(
                            'reminder-notification', {
                              type: 'basic',
                              iconUrl: 'notif-icon_white.png',

                              title: 'Your reminder!',
                              message: removedVal[0].msg
                            }, function () {} );

                        alert(removedVal[0].msg);

                        i--;
                    }
                }

                chrome.storage.local.set({uniqKey2: expired}, function () { });
                chrome.storage.local.set({uniqKey: reminders}, function () { });

                chrome.runtime.sendMessage({allReminders: reminders, expiredReminders: expired, cmd: "sendAll"}, function () { });

            });
        }
        if(request.cmd == "delete")
        {
            reminders = request.newList;

            chrome.storage.local.set({uniqKey: reminders}, function () { });
        }
        if(request.cmd == "deleteExp")
        {
            expired = request.newExpiredList;

            chrome.storage.local.set({uniqKey2: expired}, function () { });
        }
        if(request.cmd == "dismissAll")
        {
            expired = [];

            chrome.storage.local.set({uniqKey2: expired}, function () { });
        }
        if(request.cmd == "normal")
        {
            reminders.push(request);

            var min;
            var tDiff;
            for(var i=0; i<reminders.length; i++)
            {
                min=i;
                for(var j=i+1; j<reminders.length; j++)
                {
                    tDiff = (Date.parse(reminders[min].expireDate) - Date.parse(reminders[j].expireDate));
                    if(tDiff>0)
                    {
                        min=j;
                    }
                }

                var tmp = reminders[min];
                reminders[min] = reminders[i];
                reminders[i] = tmp;
            }

            chrome.storage.local.set({uniqKey: reminders}, function () { });

            reminders=[];
            chrome.storage.local.get(null, function (items) 
            {
                for(var i=0;i<items.uniqKey.length;i++)
                {
                    reminders.push(items.uniqKey[i]);
                }

                chrome.runtime.sendMessage({allReminders: items,cmd: "refresh"}, function () { });

            });
        }

        setTimeout(function() 
        {
            sendResponse({status: true});
        }, 1);
        return true;
});

