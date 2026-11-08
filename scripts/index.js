// TODO: TankTrouble-ify the dialogs

class ModManager
{
	constructor()
	{
		this.container = document.getElementById("snippet-container");
	}

	async getMods()
	{
		const result = await browser.storage.local.get("ttmods");
		var tempresult = result.ttmods || [];
		console.log(tempresult);
		
		return tempresult.filter(mod => mod !== undefined);
	}

	async saveMods(mods)
	{
		console.log(mods);
		await browser.storage.local.set({ ttmods: mods });
	}

	async deleteMod(id)
	{
		const mods = await this.getMods();
		mods.splice(id, 1);
		console.log(mods);
		await this.saveMods(mods);
		updateList();
	}

	async moveMod(id, offset)
	{
		const mods = await this.getMods();
		const target = id + offset;

		if (target < 0 || target >= mods.length)
			return;

		[mods[id], mods[target]] = [mods[target], mods[id]];

		await this.saveMods(mods);
		updateList();
	}

	async createMod(title, author)
	{
		const mods = await this.getMods();
		
		mods.push
		(
			{
				title,
				author,
				script: "",
				enabled: true
			}
		);

		await this.saveMods(mods);
		updateList();
	}

	render()
	{
		this.container.innerHTML = "";

		this.getMods().then
		(
			mods =>
			{
				mods.forEach
				(
					(mod, id) =>
					{
						const snippet = new ModSnippet(mod, id, mods.length);
						this.container.appendChild(snippet.element);
					}
				);
			}
		);
	}
}

// this class does nothing but render the elements for us
class ModSnippet
{
	constructor(mod, id, total)
	{
		this.mod = mod;
		// force cast to number to not get confused by 0 + 1 = 01
		this.id = Number(id);
		this.total = total;

		this.element = document.createElement("table");
		this.element.className = "snippet";

		this.render();
		this.addEvents();
	}

	render()
	{
		const { mod, id, total } = this;

		this.element.innerHTML = `
			<tr style="border-bottom: 2px solid white;">
				<td colspan="2" style="text-align: left; padding: 15px;">
					${mod.title}
				</td>
				<td style="padding: 15px;">
					<button class="delete">Delete</button>
				</td>
			</tr>
			<tr>
				<td class="author-label">
					Author: ${mod.author}
				</td>
				<td style="width: fit-content; border-style: none; text-align: right"></td>
				<td style="width: 1%; text-align: right; padding-right: 15px;">
					<div style="display: flex; align-items: center; float: right;">
						<input type="checkbox" style="height: 14px;"
							${mod.enabled ? "checked" : ""}>
						<div>
							<button class="${id === 0 ? "disabled" : "move-up"}">↑</button><br>
							<button class="${id === total - 1 ? "disabled" : "move-down"}">↓</button>
						</div>
					</div>
				</td>
			</tr>
		`;
	}

	addEvents()
	{
		this.element.addEventListener
		(
			"click", () =>
			{
				document.querySelectorAll(".snippet").forEach
				(
					snip => snip.classList.remove("selected")
				);

				this.element.classList.add("selected");

				view.dispatch
				(
					{
						changes: 
						{
							from: 0,
							to: view.state.doc.length,
							insert: this.mod.script
						},
						effects: readOnlyCompartment.reconfigure
						(
							CodeMirror.EditorState.readOnly.of(false)
						)
					}
				);
			}
		);

		this.element.querySelectorAll("button").forEach
		(
			button =>
			{
				button.addEventListener
				(
					"click", event =>
					{
						event.stopPropagation();

						if(button.classList.contains("delete"))
						{
							// Ok / Cancel does not fit but this'll do for now
							if(confirm("Are you sure you want to delete this mod?"))
							{
								manager.deleteMod(this.id);
							}
						}

						if(button.classList.contains("move-up"))
							manager.moveMod(this.id, -1);

						if(button.classList.contains("move-down"))
							manager.moveMod(this.id, 1);
					}
				);
			}
		);
	}
}

class CreateModOverlay 
{
	constructor()
	{
		this.element = document.createElement("div");
		this.element.id = "pageOverlay";
		this.element.classList.add("overlay");
		
		var container = document.createElement("div");
		container.classList.add("container");
		
		this.titleInput = document.createElement("input");
		this.titleInput.classList.add("text-input");
		this.titleInput.placeholder = "Title";
		
		container.appendChild(this.titleInput);
		this.element.appendChild(container);
		container = document.createElement("div");
		container.classList.add("container");
		
		this.authorInput = document.createElement("input");
		this.authorInput.classList.add("text-input");
		this.authorInput.placeholder = "Author";
		
		container.appendChild(this.authorInput);
		this.element.appendChild(container);
		container = document.createElement("div");
		container.classList.add("container");
		
		this.createButton = document.createElement("button");
		this.createButton.classList.add("create");
		this.createButton.innerText = "Create"
		
		container.appendChild(this.createButton);
		this.element.appendChild(container);
		
		this.closeButton = document.createElement("button");
		this.closeButton.classList.add("close-button");
		this.closeButton.innerText = "×";
		this.element.appendChild(this.closeButton);
		
		this.addEvents();
		
		document.body.appendChild(this.element);
		
		this.fadeIn();
	}
	
	fadeIn()
	{
		const target = this.element;

		target.offsetHeight; // HACK: force recalc
		target.style.opacity = "1";
	}
	
	fadeOut()
	{
		var _parent = this;
		const target = this.element;
		
		target.style.opacity = "0";
		
		target.addEventListener
		(
			"transitionend", () =>
			{
				target.remove();
			}
		);
	}
	
	addEvents()
	{
		var _parent = this;
		this.createButton.onclick = async () =>
		{		
			const title  = _parent.titleInput.value;
			const author  = _parent.authorInput.value;
			var validInput = true;
			
			if(title == "")
			{
				alert("Please add a title.");
				validInput = false;
			}
			
			if(author == "")
			{
				alert("Please add an author.");
				validInput = false;
			}
			
			if(validInput) 
			{
				await manager.createMod(title, author);
				_parent.fadeOut();
			}
		};
		
		this.closeButton.onclick = () => _parent.fadeOut();
	}
}


const readOnlyCompartment = new CodeMirror.Compartment();
const view = new CodeMirror.EditorView
(
	{
		extensions: 
		[
			CodeMirror.basicSetup,
			CodeMirror.javascript(),
			readOnlyCompartment.of(CodeMirror.EditorState.readOnly.of(true))
		],
		parent: document.getElementById("editor")
	}
);



const manager = new ModManager();

function updateList()
{
	view.dispatch
	(
		{
			changes: 
			{
				from: 0,
				to: view.state.doc.length,
				insert: "// Select a mod to continue..."
			}
		}
	);

	manager.render();
}

updateList();

const addModButton = document.createElement("button");
addModButton.classList.add("add-mod")
addModButton.innerText = "+";
document.body.appendChild(addModButton);
addModButton.onclick = async () =>
{		
	new CreateModOverlay();
};