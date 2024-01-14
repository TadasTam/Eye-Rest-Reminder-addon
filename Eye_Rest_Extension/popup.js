var eyeRestMessage = "Take an Eye rest! > <";
var minutesRest = 20;

var reminders = [];
var expired = [];

window.onload = function() 
{
    var loadedTime = Date();

    chrome.runtime.sendMessage({msg: "handshake",cmd:"handshake", date: loadedTime}, function (response) { });

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) 
    {
            if (request.cmd == "sendAll")
            {
                while (document.getElementById("reminders").firstChild) 
                {
                    document.getElementById("reminders").removeChild(document.getElementById("reminders").firstChild);
                }

                while (document.getElementById("expRems").firstChild) 
                {
                    document.getElementById("expRems").removeChild(document.getElementById("expRems").firstChild);
                }

                reminders = request.allReminders;
                expired = request.expiredReminders;

                var btn;

                for (var i = 0; i < reminders.length; i++) 
                {
                        var newElement = document.createElement("LI");
                        if (reminders[i].msg != eyeRestMessage)
                        {
                            btn = document.createElement("BUTTON");
                            btn.appendChild(document.createTextNode('X'));

                            btn.id = reminders[i].date;

                            newElement.appendChild(btn);
                        }
                        
                        var newString = reminders[i].expireDate.split("GMT");
                        newElement.appendChild(document.createTextNode(" " + reminders[i].msg + "          " + "Due time: " + newString[0]));
                        document.getElementById("reminders").appendChild(newElement);
                }

                var btn2;

                if(expired.length>0) 
                {
                    for (var i = 0; i < expired.length; i++) {
                        var newElement = document.createElement("LI");

                        btn2 = document.createElement("BUTTON");
                        btn2.appendChild(document.createTextNode('X'));

                        btn2.id = expired[i].date;

                        newElement.appendChild(btn2);
                        var newString = expired[i].expireDate.split("GMT");
                        newElement.appendChild(document.createTextNode(" " + expired[i].msg + "          " + "Expired: " + newString[0]));
                        document.getElementById("expRems").appendChild(newElement);
                    }
                }

                document.getElementById("reminders").addEventListener("click", function (e) 
                {
                    if (e.target && (e.target.nodeName == "BUTTON" || e.target.nodeName == "I")) 
                    {
                        for(var i = 0; i < reminders.length; i++)
                        {
                            if(reminders[i].date == e.target.id)
                            {
                                reminders.splice(i,1);
                                document.getElementById("reminders").removeChild(document.getElementById("reminders").childNodes[i]);

                                chrome.runtime.sendMessage({newList: reminders, cmd:"delete"}, function (response) { });
                            }
                        }
                    }
                });

                document.getElementById("expRems").addEventListener("click", function (e) 
                {
                    if (e.target && (e.target.nodeName == "BUTTON" || e.target.nodeName == "I")) 
                    {
                        for(var i = 0; i < expired.length; i++)
                        {
                            if(expired[i].date == e.target.id)
                            {
                                expired.splice(i,1);
                                document.getElementById("expRems").removeChild(document.getElementById("expRems").childNodes[i]);

                                chrome.runtime.sendMessage({newExpiredList: expired, cmd:"deleteExp"}, function (response) { });

                            }
                        }
                    }
                });
            }

        setTimeout(function() 
        {
            sendResponse({status: true});
        }, 1);
        return true;
    });
}

document.addEventListener('DOMContentLoaded', function() 
{
    document.getElementById('submit').addEventListener('click', function() 
    {
        var newReminder = document.getElementById("reminder").value;
        var expirationTime = document.getElementById("expireTime").value;
        var expDateStr = String(new Date(expirationTime));
        var timeStamp = Date();
        var timeDifference = Date.parse(timeStamp) - Date.parse(expDateStr);

        if(newReminder == "" && expirationTime == "")
        {
            alert("Enter your message and a Time!");
        }
        else
        {
            if(newReminder == "")
            {
                alert("Enter your message!");
            }
            if(expirationTime == "")
            {
                alert("Enter a DateTime!");
            }
            if(timeDifference >= 0)
            {
                alert("Whoops! Seems like you already missed your plans");
            }
        }

        if(newReminder != "" && expirationTime != "" && timeDifference < 0)
        {
            document.getElementById("reminder").value = "";
            document.getElementById("expireTime").value = "";

            chrome.runtime.sendMessage({msg: newReminder, date: timeStamp, expireDate: expDateStr, cmd: "normal"}, function (response) { });

            chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) 
            {
                    if (request.cmd == "refresh") 
                    {
                        reminders = request.allReminders.uniqKey;
                        while (document.getElementById("reminders").firstChild) 
                        {
                            document.getElementById("reminders").removeChild(document.getElementById("reminders").firstChild);
                        }

                        var btn;

                        for (var i = 0; i < reminders.length; i++) 
                        {
                            if (reminders[i].msg != eyeRestMessage)
                            {
                                var newElement = document.createElement("LI");

                                btn = document.createElement("BUTTON");
                                btn.appendChild(document.createTextNode('X'));

                                btn.id = reminders[i].date;

                                newElement.appendChild(btn);
                                var newString = reminders[i].expireDate.split("GMT");
                                newElement.appendChild(document.createTextNode(" " + reminders[i].msg + "     Due time: " + newString[0]));
                                document.getElementById("reminders").appendChild(newElement);
                            }
                        }
                    }

                    setTimeout(function() 
                    {
                        sendResponse({status: true});
                    }, 1);
                    return true;
            });


        }
    });

    document.getElementById('dismiss').addEventListener('click', function() 
    {
        chrome.runtime.sendMessage({cmd: "dismissAll"}, function (response) 
        {
                while (document.getElementById("expRems").firstChild) 
                {
                    document.getElementById("expRems").removeChild(document.getElementById("expRems").firstChild);
                }
            });
    });
});
