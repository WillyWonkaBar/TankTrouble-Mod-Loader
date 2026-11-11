window.addEventListener
(
	"__Mod_Loader",
	(event) =>
	{
		var mods = JSON.parse(event.detail);
		fetch(document.querySelector("[src^='/build/js/index-']")?.src)
		.then
		(
			(response) => 
			{
				if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
				return response.text()
			}
		)
		.then
		(
			(text) => 
			{
				// TODO: Do this with all classes.
				var replacements = 
				{
					"Caches":					RegExp("([A-Z a-z]+)\\.getPlayerDetailsCache\\(\\)", "g").exec(text)[1],
					"TankTrouble":			RegExp("([A-z a-z]+)\\.ErrorBox.show\\(", "g").exec(text)[1],
					"GameManager":		RegExp("([A-z a-z]+)\\.disableGameInput\\(\\)").exec(text)[1],
					"Backend":					RegExp("=>([A-z a-z]+)\\.getPlayerDetails\\(").exec(text)[1],
					"ClientManager":		RegExp("\\.achievementUnlockNotification\\),([A-z a-z]+)\\.getClient\\(\\)").exec(text)[1],
					"Content":					RegExp("\\.WallOfFame\\.init\\(\\),([A-z a-z]+)\\.init\\(\\)").exec(text)[1],
					"Constants":				RegExp("([A-z a-z]+)\\.EMBLEM_TYPES\\.TERMINATOR").exec(text)[1],
					"Game":						RegExp("([A-z a-z]+)\\.UIMenuState=").exec(text)[1],
					"Utils":						RegExp("([A-z a-z]+)\\.addOverlayFormRow\\(").exec(text)[1],
					"OverlayManager":	RegExp("([A-z a-z]+)\\.replacePotentialOverlay\\(").exec(text)[1],
					"UIGameState":			RegExp("\\s([A-z a-z]+)=class{gameController=").exec(text)[1]
				}

				// Debugging
				console.log(replacements);

				var reload = (localStorage.getItem("_tt-index.js") == null);
				for(mod of mods) 
				{
					if(mod == undefined|| !mod.enabled)
					{
						console.log(`Skipped mod: %c${mod.title}`, `color: red`);
						continue;
					}
					
					for(k in replacements)
					{
						var regex = new RegExp(`${k}\\.`, "g");
						mod.script = mod.script.replace(regex, `${replacements[k]}.`);
					}
					console.log(`Loaded mod: %c${mod.title}`, `color: lime`);
					text += `\n${mod.script}`;
				}

				localStorage.setItem("_tt-index.js", text);
				//console.log(localStorage.getItem("_tt-index.js"));
				
				if(reload)
				{
					console.log("Storage set, reloading page.");
					location.reload();
				}
			}
		);
	}
)
/*

 */