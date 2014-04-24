var toggleReload = false;

function reconnect()
{
	setControlsEnabled(false, true);

	var commands = "\nifup wan\n";
	var param = getParameterDefinition("commands", commands) + "&" + getParameterDefinition("hash", document.cookie.replace(/^.*hash=/,"").replace(/[\t ;]+.*$/, ""));

	var stateChangeFunction = function(req)
	{
		if(req.readyState == 4){setControlsEnabled(true);}
	}
	runAjax("POST", "/utility/run_commands1.sh", param, stateChangeFunction);
}

function reboot()
{
	setControlsEnabled(false, true);

	var commands = "\nsh /usr/lib/gargoyle/reboot.sh\n";
	var param = getParameterDefinition("commands", commands) + "&" + getParameterDefinition("hash", document.cookie.replace(/^.*hash=/,"").replace(/[\t ;]+.*$/, ""));

	var stateChangeFunction = function(req)
	{
		if(req.readyState == 4){}
	}
	runAjax("POST", "/utility/run_commands1.sh", param, stateChangeFunction);

	currentProtocol = location.href.match(/^https:/) ? "https" : "http";
	testLocation = currentProtocol + "://" + window.location.host + "/utility/reboot_test.sh";
	testReboot = function()
	{
		toggleReload = true;
		setTimeout( "testReboot()", 5*1000);
		document.getElementById("reboot_test").src = testLocation;
	}
	setTimeout( "testReboot()", 25*1000);
	setTimeout( "reloadPage()", 240*1000);
}

function reloadPage()
{
	if(toggleReload)
	{
		var reloadState = document.getElementById("reboot_test").readyState;
		if( typeof(reloadState) == "undefined" || reloadState == null || reloadState == "complete")
		{
			toggleReload = false;
			document.getElementById("reboot_test").src = "";
			window.location.href = window.location.href;
		}
	}
}
