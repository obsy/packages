/*
 * This program is copyright © 2010-2012 Cezary Jackiewicz and is distributed under the terms of the GNU GPL 
 * version 2.0 with a special clarification/exception that permits adapting the program to 
 * configure proprietary "back end" software provided that all modifications to the web interface
 * itself remain covered by the GPL. 
 * See http://gargoyle-router.com/faq.html#qfoss for more information
 */

var pkg = "vsftpd";

function saveChanges()
{
	var Commands = [];

	var allOriginalUsers = uciOriginal.getAllSectionsOfType(pkg, "user");
	while(allOriginalUsers.length > 0)
	{
		var section = allOriginalUsers.shift();
		uciOriginal.removeSection(pkg, section);
		Commands.push("uci del " + pkg + "." + section);
	}

	var allOriginalUsers = uciOriginal.getAllSectionsOfType(pkg, "vsftpd");
	if (allOriginalUsers.length == 0)
	{
		Commands.push("uci add " + pkg + " vsftpd");
	}
	var anonymous = document.getElementById("ftp_anonymous").checked ? "yes":"no";
	Commands.push("uci set " + pkg + ".@vsftpd[0].anonymous=" + anonymous);
	var anonymous_write = document.getElementById("ftp_anonymous_write").checked ? "yes":"no";
	Commands.push("uci set " + pkg + ".@vsftpd[0].anonymous_write=" + anonymous_write);

	var anonymous_root = document.getElementById("ftp_anonymous_root").value;
	if (anonymous_root == "" && anonymous == "yes")
	{
		alert("Katalog użytkownika anonymous nie może być pusty!");
		return;
	}

	Commands.push("uci set " + pkg + ".@vsftpd[0].anonymous_root=" + document.getElementById("ftp_anonymous_root").value);

	var sections = uci.getAllSectionsOfType(pkg, "user");
	for(sectionIndex=0; sectionIndex < sections.length; sectionIndex++)
	{
		Commands.push("uci set " + pkg + ".user_" + sectionIndex + "=user");
		Commands.push("uci set " + pkg + ".user_" + sectionIndex + ".username=" + uci.get(pkg, sections[sectionIndex], "username"));
		Commands.push("uci set " + pkg + ".user_" + sectionIndex + ".password=" + uci.get(pkg, sections[sectionIndex], "password"));
		Commands.push("uci set " + pkg + ".user_" + sectionIndex + ".write=" + uci.get(pkg, sections[sectionIndex], "write"));
		Commands.push("uci set " + pkg + ".user_" + sectionIndex + ".root=" + uci.get(pkg, sections[sectionIndex], "root"));
	}
	Commands.push("uci commit");

	Commands.push("/etc/init.d/vsftpd stop");

	var enabled = document.getElementById("ftp_enabled").checked == true;
	if(enabled == true)
	{
		Commands.push("/etc/init.d/vsftpd enable");
		Commands.push("/etc/init.d/vsftpd start");
	}
	else
	{
		Commands.push("/etc/init.d/vsftpd disable");
	}

	if(document.getElementById("ftp_enabled_from_wan").checked == true)
	{
		Commands.push("uci set firewall.ftp_wan=rule");
		Commands.push("uci set firewall.ftp_wan.src=wan");
		Commands.push("uci set firewall.ftp_wan.target=ACCEPT");
		Commands.push("uci set firewall.ftp_wan.proto=tcp");
		Commands.push("uci set firewall.ftp_wan.dest_port=21");
	}
	else
	{
		Commands.push("uci del firewall.ftp_wan");
	}
	Commands.push("uci commit");
	Commands.push("/etc/init.d/firewall restart");

	setControlsEnabled(false, true);

	var param = getParameterDefinition("commands", Commands.join("\n")) + "&" + getParameterDefinition("hash", document.cookie.replace(/^.*hash=/,"").replace(/[\t ;]+.*$/, ""));
	var stateChangeFunction = function(req)
	{
		if(req.readyState == 4)
		{
			uciOriginal = uci.clone();
			setControlsEnabled(true);
		}
	}

	runAjax("POST", "utility/run_commands.sh", param, stateChangeFunction);
}


function resetData()
{
	var vsftpdSections = uciOriginal.getAllSectionsOfType(pkg, "vsftpd");

	document.getElementById("ftp_anonymous").checked = uciOriginal.get(pkg, vsftpdSections[0], "anonymous") == "yes";
	document.getElementById("ftp_anonymous_write").checked = uciOriginal.get(pkg, vsftpdSections[0], "anonymous_write") == "yes";
	document.getElementById("ftp_anonymous_root").value = uciOriginal.get(pkg, vsftpdSections[0], "anonymous_root");

	var userSections = uciOriginal.getAllSectionsOfType(pkg, "user");
	var userTableData = [];
	for(sectionIndex = 0; sectionIndex < userSections.length; sectionIndex++)
	{
		var username = uciOriginal.get(pkg, userSections[sectionIndex], "username");
		var password = uciOriginal.get(pkg, userSections[sectionIndex], "password");
		var write = uciOriginal.get(pkg, userSections[sectionIndex], "write");
		var root = uciOriginal.get(pkg, userSections[sectionIndex], "root");

		var writeCheckbox = createInput('checkbox');
		writeCheckbox.disabled = true;
		writeCheckbox.checked = write == "yes";

		userTableData.push( [ username, password, writeCheckbox, root, createEditButton(true) ] );
	}

	initUserValue();

	columnNames=["Nazwa", "Hasło", "Zapis", "Katalog", ""];
	userTable = createTable(columnNames, userTableData, "users_table", true, false, removeUserCallback);
	tableContainer = document.getElementById('users_table_container');
	if(tableContainer.firstChild != null)
	{
		tableContainer.removeChild(tableContainer.firstChild);
	}
	tableContainer.appendChild(userTable);

	document.getElementById("ftp_enabled").checked = ftpEnabled;
	document.getElementById("ftp_enabled_from_wan").checked = ftpEnabledFromWan;

	setFtpEnabled(ftpEnabled);
}

function addNewUser()
{
	var username = document.getElementById("ftp_user").value;
	var password = document.getElementById("ftp_pass").value;
	var write = document.getElementById("ftp_write").checked;
	var root = document.getElementById("ftp_root").value;

	if (username == "")
	{
		alert("Nazwa użytkownika musi być podana!");
		return;
	}
	if (password == "")
	{
		alert("Hasło nie może być puste!");
		return;
	}

	if ((username == "root") || (username == "ftp"))
	{
		alert("Błędna nazwa użytkownika!");
		return;
	}

	if (root == "")
	{
		alert("Katalog nie może być pusty!");
		return;
	}

	var sections = uci.getAllSectionsOfType(pkg, "user");
	for(sectionIndex=0; sectionIndex < sections.length; sectionIndex++)
	{
		if(uci.get(pkg, sections[sectionIndex], "username") == username)
		{
			alert("Użytkownik został już dodany!");
			return;
		}
	}

	var tableContainer = document.getElementById("users_table_container");
	var table = tableContainer.firstChild;

	var writeCheckbox = createInput('checkbox');
	writeCheckbox.disabled = true;
	writeCheckbox.checked = write;

	addTableRow(table, [ username, password, writeCheckbox, root, createEditButton(true)], true, false, removeUserCallback);

	uci.set(pkg, sectionIndex, "", "user");
	uci.set(pkg, sectionIndex, "username", username);
	uci.set(pkg, sectionIndex, "password", password);
	uci.set(pkg, sectionIndex, "write", write ? "yes" : "no" );
	uci.set(pkg, sectionIndex, "root", root);
	initUserValue();
}

function initUserValue()
{
	document.getElementById("ftp_user").value = "";
	document.getElementById("ftp_pass").value = "";
	document.getElementById("ftp_write").checked = false;
	document.getElementById("ftp_root").value = "/tmp/usb_mount";
}

function createEditButton(enabled)
{
	editButton = createInput("button");
	editButton.value = "Edycja";
	editButton.className="default_button";
	editButton.onclick = editUser;
	
	editButton.className = enabled ? "default_button" : "default_button_disabled" ;
	editButton.disabled  = enabled ? false : true;

	return editButton;
}

function removeUserCallback(table, row)
{
	var username = row.childNodes[0].firstChild.data;

	var sections = uci.getAllSectionsOfType(pkg, "user");
	for(sectionIndex=0; sectionIndex < sections.length; sectionIndex++)  
	{
		if(uci.get(pkg, sections[sectionIndex], "username") == username)
		{
			uci.removeSection(pkg, sections[sectionIndex]);
		}
	}
}

function editUser()
{
	if( typeof(editUserWindow) != "undefined" )
	{
		//opera keeps object around after
		//window is closed, so we need to deal
		//with error condition
		try
		{
			editUserWindow.close();
		}
		catch(e){}
	}

	try
	{
		xCoor = window.screenX + 225;
		yCoor = window.screenY+ 225;
	}
	catch(e)
	{
		xCoor = window.left + 225;
		yCoor = window.top + 225;
	}

	editUserWindow = window.open("ftp_edit_user.sh", "edit", "width=560,height=600,left=" + xCoor + ",top=" + yCoor );

	var saveButton = createInput("button", editUserWindow.document);
	var closeButton = createInput("button", editUserWindow.document);
	saveButton.value = "Zamknij i zapisz zmiany";
	saveButton.className = "default_button";
	closeButton.value = "Zamknij i anuluj zmiany";
	closeButton.className = "default_button";

	var editRow=this.parentNode.parentNode;
	var username = editRow.childNodes[0].firstChild.data;

	var editSection = "";
	var sections = uci.getAllSectionsOfType(pkg, "user");
	for(sectionIndex=0; sectionIndex < sections.length && editSection == ""; sectionIndex++)
	{
		if(uci.get(pkg, sections[sectionIndex], "username") == username)
		{
			editSection = sections[sectionIndex];
		}
	}

	var password = uci.get(pkg, editSection, "password");
	var write = uci.get(pkg, editSection, "write");
	var root = uci.get(pkg, editSection, "root");

	var runOnEditorLoaded = function ()
	{
		var updateDone=false;
		if(editUserWindow.document != null)
		{
			if(editUserWindow.document.getElementById("bottom_button_container") != null)
			{
				editUserWindow.document.getElementById("bottom_button_container").appendChild(saveButton);
				editUserWindow.document.getElementById("bottom_button_container").appendChild(closeButton);

				setElementEnabled( editUserWindow.document.getElementById("ftp_user"), false, username);
				editUserWindow.document.getElementById("ftp_pass").value = password;
				editUserWindow.document.getElementById("ftp_write").checked = write == "yes";
				editUserWindow.document.getElementById("ftp_root").value = root;

				closeButton.onclick = function()
				{
					editUserWindow.close();
				}
				saveButton.onclick = function()
				{

					editRow.childNodes[1].firstChild.data = editUserWindow.document.getElementById("ftp_pass").value;
					editRow.childNodes[2].firstChild.data = editUserWindow.document.getElementById("ftp_write").checked;
					editRow.childNodes[3].firstChild.data = editUserWindow.document.getElementById("ftp_root").value;

					uci.set(pkg, editSection, 'password', editUserWindow.document.getElementById("ftp_pass").value);
					uci.set(pkg, editSection, 'write', editUserWindow.document.getElementById("ftp_write").checked ? "yes" : "no");
					uci.set(pkg, editSection, 'root', editUserWindow.document.getElementById("ftp_root").value);

/*
					var sections = uci.getAllSectionsOfType(pkg, "user");
					for(sectionIndex=0; sectionIndex < sections.length; sectionIndex++)
					{
						if(uci.get(pkg, sections[sectionIndex], "username") == username)
						{
							uci.set(pkg, sections[sectionIndex], 'password', editUserWindow.document.getElementById("ftp_pass").value);
							uci.set(pkg, sections[sectionIndex], 'write', editUserWindow.document.getElementById("ftp_write").checked ? "yes" : "no");
							uci.set(pkg, sections[sectionIndex], 'root', editUserWindow.document.getElementById("ftp_root").value);
						}
					}
*/

					editUserWindow.close();
				}
				editUserWindow.moveTo(xCoor,yCoor);
				editUserWindow.focus();
				updateDone = true;

			}
		}
		if(!updateDone)
		{
			setTimeout(runOnEditorLoaded, 250);
		}
	}
	runOnEditorLoaded();
}

function setFtpEnabled(enabled)
{
	var ids=['ftp_enabled_from_wan', 'ftp_anonymous', 'ftp_anonymous_write', 'ftp_anonymous_root', 'ftp_user', 'ftp_pass', 'ftp_write', 'ftp_root', 'add_class_button'];
	var idIndex;
	for (idIndex in ids)
	{
		var element = document.getElementById(ids[idIndex]);
		setElementEnabled(element, enabled, element.value);
	}

	var usersTable = document.getElementById('users_table_container').firstChild;
	setRowClasses(usersTable, enabled);
	updateVisibility();
}

function updateVisibility()
{
	var ids= ["ftp_anonymous_write", "ftp_anonymous_root"];
	var enabled = document.getElementById("ftp_anonymous").checked;

	var idIndex;
	for (idIndex in ids)
	{
		var element = document.getElementById(ids[idIndex]);
		setElementEnabled(element, enabled, element.value);
	}
}
