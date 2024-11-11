const sleep = ms => new Promise(r => setTimeout(r, ms));

/*
Rolls a die of a user-specified size at the start of each combat round.
*/
export async function roundStartRoll(combat, updates, options, userId){
	// Return if the use isn't the GM or if it isn't the start of a new round
	if(!game.settings.get('lancer-mini-automations', 'roundStartEnable') || !game.user.isGM || !foundry.utils.hasProperty(updates, "round")){
		return;
	}
    
    let dieSize = await game.settings.get('lancer-mini-automations', 'roundStartDieSize');
    let chatName = await game.settings.get('lancer-mini-automations', 'roundStartRollName');
	let check = new Roll(`1d` + dieSize);
	await check.roll();

	let mainResultText = ``;
	mainResultText = `<span style="text-align:left;margin-left:5px">${check.terms[0].number}d${check.terms[0].faces}</span>`;

	let content =
		`
		<div class="card clippled-bot" style=margin:0px">
		   <div class="lancer-header">// ${chatName} //</div>
		   <div class="dice-roll lancer-dice-roll">
			  <div class="dice-result">
				 <div class="dice-formula lancer-dice-formula flexrow">
					${mainResultText}
					<span class="dice-total lancer-dice-total major">${check.total}</span>
				 </div>
				 <div style="text-align:left">
					<div class="dice-tooltip" style="display: none;">
					   <section class="tooltip-part">
						  <div class="dice">
							 <header class="part-header flexrow">
								<span class="part-formula">${check.terms[0].number}d${check.terms[0].faces}</span>
								<span class="part-total">${check.terms[0].total}</span>
							 </header>
						  </div>
					   </section>
					</div>
				 </div>
			  </div>
		   </div>
		</div>
		`;

	await ChatMessage.create({
		type: CONST.CHAT_MESSAGE_TYPES.ROLL,
		rolls: [check],
		user: game.user._id,
		content: content
	});
}

/*
During combat, scans NPC features for traits related to attacking, 
and notifies the GM of each trait's effects through a UI notification.
*/
export async function npcAttackTraitReminder(state){
	if(!game.user.isGM 
		|| !game.combat 
		|| !state.actor.is_npc() 
		|| await game.settings.get('lancer-mini-automations', 'enableNPCTraitReminders') === false)
			return;

	const keywords = /on (all )?(subsequent )?attacks(when |against )?|(successfully |makes a successful )attack|attacks (with|deal)|ignores Hidden|bonus damage|The ([^\s]+) hits with a|^Against characters|when the ([^\s]+ )?(hits|attacks|makes a ([^\s]+)? attack)/i;

	// We can get the NPC through the state
	let atkTraits = [];
	let allTraits = await state.actor.loadoutHelper.listLoadout();
	allTraits.forEach(trait => {
		if(trait.type?.localeCompare("npc_feature") === 0 && (trait.system?.type?.localeCompare("Trait") === 0 
															|| trait.system?.type?.localeCompare("System") === 0
															|| trait.system?.type?.localeCompare("Reaction") === 0)){
			let traitEffect;
			if(trait.system?.type?.localeCompare("Reaction") === 0){
				traitEffect = trait.system.trigger?.replace(/<[^>]*>/g,'');
			}else{
				traitEffect = trait.system.effect?.replace(/<[^>]*>/g,'');
			}
			if(traitEffect?.match(keywords) != null){
				atkTraits.push(trait.name + ": " + traitEffect);
			}
		}
	});
	atkTraits.forEach(trait =>{
		ui.notifications.notify(trait)
	});
}

/*
Display a ui reminder whenever a HASE stat is rolled 
if the mech has an ability that modifies HASE rolls
*/
export async function haseReminders(state){
	const stat = state.data.title.toUpperCase();
	const isNpc = await state.actor.is_npc();

	// This should match all save/check modifying abilities on both PCs (I manaully checked all of them) and NPCs (used some examples)
	const keywords = /\+1 (difficulty|accuracy) on (all )?(hull|agility|system|engineering|checks and saves)/i;

	let modTrait;
	if(isNpc){
		await state.actor.loadoutHelper.listLoadout().forEach(loadout => {
			if(foundry.utils.hasProperty(loadout, "system.effect") && loadout.system.effect.match(keywords) != null && loadout.system.effect.toUpperCase().includes(stat)){
				modTrait = loadout.system.parent.name + ": " + loadout.system.effect;
			}
		});
	}else{
		await state.actor.loadoutHelper.listLoadout().forEach(loadout => {
			if(loadout.type.localeCompare("frame") === 0){
				loadout?.system?.traits.forEach(trait => {
					if(trait.description.match(keywords) != null && trait.description.toUpperCase().includes(stat)){
						modTrait = trait.name + ": " + trait.description;
					}
				});
			}
		});
	}

	if(await game.settings.get('lancer-mini-automations', 'enableHaseReminders') && modTrait != undefined){
		ui.notifications.notify(modTrait);
	}
}

/**
 * Ram rules text reminder
 */
export async function ramReminder(state){
	ui.notifications.notify("Reminder: Ram (by default) only works on equal size or smaller.");
}

/**
 * Checks for chats that mention "saves". When it 
 * finds one, determines the type of save and who
 * instigated it. The function then outputs a button
 * to chat that has the save target of the pc/npc.
 */
export async function saveReminder(state){
	
}