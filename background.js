const browserAPI = typeof browser !== "undefined" ? browser : chrome;

browserAPI.action.onClicked.addListener
(
	() => 
	{
		browserAPI.tabs.create
		(
			{
				url: browserAPI.runtime.getURL("index.html")
			}
		);
	}
);

// Setup the default mods
browserAPI.storage.local.get
(
	"ttmods", 
	(result) => 
	{
		if(result.ttmods == undefined) 
		{
			browserAPI.storage.local.set
			(
				{
					ttmods: 
					[
						{
							"title":	"Game Joiner",
							"author": "WillyWonkaBar",
							"script": `
if(("_showRelevantButtonsAndInfoOG" in TankTrouble.TankInfoBox) == false)
	TankTrouble.TankInfoBox._showRelevantButtonsAndInfoOG = TankTrouble.TankInfoBox._showRelevantButtonsAndInfo;

TankTrouble.TankInfoBox._showRelevantButtonsAndInfo = function()
{
	var TankInfoBox = TankTrouble.TankInfoBox;
	TankInfoBox._showRelevantButtonsAndInfoOG();

	// Don't bother enabling the button if we are in-game.
	// if(GameManager.phaserInstance && GameManager.phaserInstance.state.current == "Game")
	//	return;

	TankInfoBox.infoGameJoin.removeClass("disabled");
	TankInfoBox.infoGameJoin.off('mouseup').on
	(
		'mouseup',
		function(event)
		{
			joinPlayerStart(TankInfoBox.playerId);
			TankInfoBox.hide();
		}
	);
}

function joinByName(username)
{
	Backend.getPlayerDetailsByUsername(username, Caches.getPlayerDetailsByUsernameCache()).then
	(
		(a)=>
		{
			if(typeof a == "string") returnTankTrouble.ErrorBox.show("Player does not exist.", "Join Error");
			joinPlayerStart(a.data.playerId);
		}
	)
}

function joinPlayerStart(client_id)
{
	Content.navigateToTab('game', '/game', {});
	ClientManager.getClient().leaveGame(true);
	if(GameManager.phaserInstance && (GameManager.phaserInstance.state.current == "Lobby" ||GameManager.phaserInstance.state.current == "Game"))
	tryJoinGame(client_id);
	else
	setTimeout(() => tryJoinGame(client_id), 500);
}

function tryJoinGame(client_id)
{
	console.log(GameManager.phaserInstance &&GameManager.phaserInstance.state.current == "Lobby")
	if(GameManager.phaserInstance &&GameManager.phaserInstance.state.current == "Lobby")
	{
		Game.UILobbyState.joiningGame = true;
		Constants.setMode(u.MODE_CLIENT_ONLINE);
		ClientManager.getClient().updateGameList();
		var lobbies =ClientManager.getClient().getAvailableGameStates();
		var foundPlayer = false;
		lobbies.forEach
		(
			(lobby) =>
			{
				var clients = lobby.data.playerStates;
				clients.forEach
				(
					(client) =>
					{
						if(client.playerId == client_id)
						{
						ClientManager.getClient().joinGame(lobby.data.id);
							foundPlayer = true;
						}
					}
				);
			}
		);

		if(!foundPlayer)
		{
		TankTrouble.ErrorBox.show("Failed to join this player's game, they may not be online.", "Join Error");
		}
	}
	else setTimeout(() => tryJoinGame(client_id), 500);
}
TankTrouble.JoinGameOverlay = 
{
	wrapper: null,
	headline: null,
	form: null,
	newUsernameInput: null,
	submitInput: null,
	userList: null,
	userListContainer: null,
	initialised: !1,
	showing: !1,
	_initialise() 
	{
		this.wrapper = $('<div class="account centre"/>'),
		this.headline = $('<div class="headline">Who do you want to join?</div>'),
		this.form = $('<form></form>'),
		this.newUsernameInput = $('<input class="username" placeholder="Player Username" name="username" type="text" autocomplete="off" maxlength="32"/>'),
		this.submitInput = $('<button class="medium" type="submit" tabindex="-1">Join</button>'),
		this.userList = $('<div style="overflow-y:auto;height:80px;display:flex;flex-direction:column;padding-left: 10px;padding-right: 10px;scrollbar-width: thin;"></div>'),
		this.userListContainer = $('<div style="justify-content: center;display:flex;border: 3px solid #808080; border-radius: 8px;background-color: #000;"></div>'),
		this.userListContainer.append(this.userList),
		this.form.append(this.headline),
		Utils.addOverlayFormRow(this.form, this.userListContainer),
		Utils.addOverlayFormRow(this.form, this.newUsernameInput),
		Utils.addOverlayFormRow(this.form, this.submitInput),
		this.wrapper.append(this.form),
		this.newUsernameInput.tooltipster
		(
			{
				side: 'right',
				theme: 'tooltipster-error'
			}
		),
		this.form.submit(s => (s.preventDefault(), this._JoinPlayerGameFromInput(), !1)),
		this.newUsernameInput.keydown(s => this._checkKeyDown(s, null)),
		this.newUsernameInput.focus
		(
			s => 
			{
				$(s.currentTarget).select(),
				$(s.currentTarget).tooltipster('open')
			}
		),
		this.initialised = !0
	},
	show(s) 
	{
		this.initialised ||
		this._initialise();
		this.showing = true;
		this.newUsernameInput.val('');
		this.submitInput.prop('disabled', !1);
		this.newUsernameInput.focus();
		ClientManager.getClient().updateGameList();
		
		// never-nesters hate me for this
		this.userList.empty();
		var users = [];
		var lobbies = ClientManager.getClient().getAvailableGameStates();
		lobbies.forEach
		(
			(lobby) =>
			{
				var clients = lobby.data.playerStates;
				clients.forEach
				(
					(client) =>
					{
						Backend.getPlayerDetails(client.playerId,Caches.getPlayerDetailsCache()).then
						(
							(h) => 
							{
								if(typeof h == 'object')
								{
									var user = h.getUsername();
									if(!users.includes(user))
									{
										var tempButton = $('<div style="font-family:TankTrouble;cursor:pointer;font-size: 12px">' + user + '</div>');
										tempButton.on("click", ()=>this.newUsernameInput.val(user))
										this.userList.append(tempButton)
										users.push(user);
									}
								}
							}
						)
					}
				);
			}
		)
	},
	hide() 
	{
		this.initialised ||
		this._initialise(),
		this.showing = !1,
		this.newUsernameInput.blur(),
		this.newUsernameInput.removeClass('inputAccepted inputRejected'),
		Utils.updateTooltip(this.newUsernameInput, '')	
	},
	getContents() 
	{
		return this.initialised ||
		this._initialise(),
		this.wrapper
	},
	shouldHide() 
	{
		return this.initialised ||
		this._initialise(),
		this.submitInput.prop('disabled') === !1
	},
	canBeCancelled() 
	{
		return true
	},
	_JoinPlayerGameFromInput() 
	{
		this.initialised ||
		this._initialise();
		var newUsername = this.newUsernameInput.val().trim();
		joinByName(newUsername);
		OverlayManager.popOverlay(!1, !0)
	},
	_checkKeyDown(s, e) 
	{
		return this.initialised ||
		this._initialise(),
		s.which === 13 ? 
		(
			e ? e.focus() : this.submitInput.prop('disabled') === !1 &&
			(s.currentTarget.blur(), this.form.submit()),
			!1
		) : !0
	},
	_showErrorMessage(s, e, t) 
	{
		e !== void 0 &&
		e === 'username' &&
		(
			this.newUsernameInput.addClass('inputRejected'),
			Utils.updateTooltip(this.newUsernameInput, s),
			t &&
			this.newUsernameInput.focus()
		),
		this.submitInput.prop('disabled', !1)
	}
};

setTimeout
(
	() => 
	{
		var b = document.createElement("button");
		b.innerHTML = "Join Game";
		b.style.paddingTop = "10px";
		b.style.paddingBottom = "10px";
		document.getElementById("tertiaryContent").appendChild(b);
		b.onclick = () =>OverlayManager.enqueueOverlay(A.JoinGameOverlay);
	}, 1000
);`,
							"enabled": true,
						},
						{
							"title":	"Disable Screenshake",
							"author": "WillyWonkaBar",
							"script": "UIGameState.prototype._addCameraShake=(_)=>_",
							"enabled": true
						}
					]
				}
			);
		}
	}
);