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

	const keywords = /on attacks when|on attacks against|on all attacks|on all subsequent attacks|makes a successful attack|successfully attacked|attacks with|attacks deal|ignores Hidden|bonus damage|^Against characters|^When the/;

	// We can get the NPC through the state
	let atkTraits = [];
	let allTraits = await state.actor.loadoutHelper.listLoadout();
	allTraits.forEach(trait => {
		if(trait.type?.localeCompare("npc_feature") === 0 && trait.system?.type?.localeCompare("Trait") === 0){
			let traitEffect = trait.system.effect?.replace(/<[^>]*>/g,'');
			if(traitEffect?.match(keywords) != null){
				atkTraits.push(trait.name + ": " + traitEffect);
			}
		}
	});
	atkTraits.forEach(trait =>{
		ui.notifications.notify(trait)
	});
}