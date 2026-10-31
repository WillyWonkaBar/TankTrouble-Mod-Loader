var mods = 
[
`
if(("_showRelevantButtonsAndInfoOG" in A.TankInfoBox) == false)
  A.TankInfoBox._showRelevantButtonsAndInfoOG = A.TankInfoBox._showRelevantButtonsAndInfo;

A.TankInfoBox._showRelevantButtonsAndInfo = function()
{
  var TankInfoBox = A.TankInfoBox;
  TankInfoBox._showRelevantButtonsAndInfoOG();

  // Don't bother enabling the button if we are in-game.
  //if(ue.phaserInstance && ue.phaserInstance.state.current == "Game")
  //  return;

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
	O.getPlayerDetailsByUsername(username, x.getPlayerDetailsByUsernameCache()).then
	(
		(a)=>
		{
		  if(typeof a == "string") return A.ErrorBox.show("Player does not exist.", "Join Error");
		  joinPlayerStart(a.data.playerId);
		}
	)
}

function joinPlayerStart(client_id)
{
  ki.navigateToTab('game', '/game', {});
  le.getClient().leaveGame(true);
  if(ue.phaserInstance && (ue.phaserInstance.state.current == "Lobby" || ue.phaserInstance.state.current == "Game"))
	tryJoinGame(client_id);
  else
	setTimeout(() => tryJoinGame(client_id), 500);
}

function tryJoinGame(client_id)
{
  console.log(ue.phaserInstance && ue.phaserInstance.state.current == "Lobby")
  if(ue.phaserInstance && ue.phaserInstance.state.current == "Lobby")
  {
	qt.UILobbyState.joiningGame = true;
	u.setMode(u.MODE_CLIENT_ONLINE);
	le.getClient().updateGameList();
	var lobbies = le.getClient().getAvailableGameStates();
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
			  le.getClient().joinGame(lobby.data.id);
			  foundPlayer = true;
			}
		  }
		);
	  }
	);

	if(!foundPlayer)
	{
	  A.ErrorBox.show("Failed to join this player's game, they may not be online.", "Join Error");
	}
  }
  else setTimeout(() => tryJoinGame(client_id), 500);
}
A.JoinGameOverlay = 
{
  wrapper: null,
  headline: null,
  usernameHeadline: null,
  form: null,
  newUsernameInput: null,
  submitInput: null,
  initialised: !1,
  showing: !1,
  _initialise() 
  {
	this.wrapper = $('<div class="account centre"/>'),
	this.headline = $('<div class="headline">Who do you want to join?</div>'),
	this.usernameHeadline = this.headline.find('.username'),
	this.form = $('<form></form>'),
	this.newUsernameInput = $('<input class="username" placeholder="Player Username" name="username" type="text" autocomplete="off" maxlength="32"/>'),
	this.submitInput = $('<button class="medium" type="submit" tabindex="-1">Join</button>'),
	this.form.append(this.headline),
	k.addOverlayFormRow(this.form, this.newUsernameInput),
	k.addOverlayFormRow(this.form, this.submitInput),
	this.wrapper.append(this.form),
	this.newUsernameInput.tooltipster({
	  side: 'right',
	  theme: 'tooltipster-error'
	}),
	this.form.submit(s => (s.preventDefault(), this._sendChangeUsername(), !1)),
	this.newUsernameInput.keydown(s => this._checkKeyDown(s, null)),
	this.newUsernameInput.focus(
	  s => {
		$(s.currentTarget).select(),
		$(s.currentTarget).tooltipster('open')
	  }
	),
	this.initialised = !0
  },
  show(s) {
	this.initialised ||
	this._initialise(),
	this.showing = !0,
	this.usernameHeadline.text(''),
	this.newUsernameInput.val(''),
	this.submitInput.prop('disabled', !1),
	this.newUsernameInput.focus()
  },
  hide() {
	this.initialised ||
	this._initialise(),
	this.showing = !1,
	this.newUsernameInput.blur(),
	this.newUsernameInput.removeClass('inputAccepted inputRejected'),
	k.updateTooltip(this.newUsernameInput, '')
  },
  getContents() {
	return this.initialised ||
	this._initialise(),
	this.wrapper
  },
  shouldHide() {
	return this.initialised ||
	this._initialise(),
	this.submitInput.prop('disabled') === !1
  },
  canBeCancelled() {
	return true
  },
  _sendChangeUsername() {
	this.initialised ||
	this._initialise();
	var newUsername = this.newUsernameInput.val().trim();
	joinByName(newUsername);
	G.popOverlay(!1, !0)
  },
  _checkKeyDown(s, e) {
	return this.initialised ||
	this._initialise(),
	s.which === 13 ? (
	  e ? e.focus() : this.submitInput.prop('disabled') === !1 &&
	  (s.currentTarget.blur(), this.form.submit()),
	  !1
	) : !0
  },
  _showErrorMessage(s, e, t) {
	e !== void 0 &&
	e === 'username' &&
	(
	  this.newUsernameInput.addClass('inputRejected'),
	  k.updateTooltip(this.newUsernameInput, s),
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
		document.getElementById("secondaryContent").appendChild(b);
		b.onclick = () => {
			G.enqueueOverlay(A.JoinGameOverlay);
		}
	}, 1000
);
`,
`Rd.prototype._addCameraShake=(_)=>_`
];

fetch(document.querySelector("[src^='/build/js/index-']")?.src)
.then((response) => {
	if (!response.ok) {
	throw new Error(`HTTP error! Status: ${response.status}`);
	}
	return response.text()
})
.then((text) => {
	var reload = (localStorage.getItem("_tt-index.js") == null);
	for(x of mods) text += x;
	localStorage.setItem("_tt-index.js", text);

	console.log("Storage set, reloading page.")
	if(reload) location.reload();
 })
