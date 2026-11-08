const browserAPI = typeof browser !== "undefined" ? browser : chrome;

browserAPI.storage.local.get
(
	"ttmods", 
	(result) => 
	{
		//console.log("result")
		//console.log(result);
		window.dispatchEvent
		(
			new CustomEvent
			(
				"__Mod_Loader", 
				{
					// An hour gone cause this is so damn confusing.
					// 1. Can't pass arrays
					// 2. I need to specify that I want to pass data from ttmods
					// 3. I'm stupid
					detail: JSON.stringify(result.ttmods)
				}
			)
		);
	}
);