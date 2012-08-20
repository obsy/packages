function setMsg()
{
	setControlsEnabled(false, true, "Proszę czekać...");

	var stateChangeFunction = function(req)
	{
		if(req.readyState == 4)
		{

			if(!req.responseText.match(/^no_msg/))
			{
				document.getElementById("msg_fields").style.display="block";
				setChildText("msg", req.responseText);
			}
			setControlsEnabled(true);
		}
	}

	runAjax("POST", "/msgip.sh", "", stateChangeFunction);
}

addLoadFunction(setMsg);
