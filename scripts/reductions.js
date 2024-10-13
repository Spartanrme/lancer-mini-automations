/** 
 * Automation for halving heat if the actor has a status named "Resist Heat"
 * @param {object} state The state object from the preUpdateActor hook
 * @param {object} updates The updates sent to the preUpdateActor hook -- This
 * is where we can find what values are being updated and by how much
 **/
export async function resistHeat(state, updates){
	// Exit if no updates to heat were detected
	if(!foundry.utils.hasProperty(updates, "system.heat")){
		return false;
	}

	let resistHeat = state.statuses.has("resist_heat");
	let modAmount = game.settings.get('lancer-mini-automations', 'modulateHeatAmount') ?? 0;
	let currentHeat = state.system.heat.value; 
	let updateHeat = updates.system.heat.value;
	// Get how much the heat was updated by
	let tempHeat = updateHeat - currentHeat;
	// Don't reduce
	if(tempHeat <= 0){
		return false;
	}else{
		// Add modulations first, then any resistances
		tempHeat += modAmount;
		// Half the heat round up
		if(resistHeat)
			tempHeat = Math.ceil(tempHeat / 2);
		// Add to current heat
		tempHeat += currentHeat;
	}
	updates.system.heat.value = tempHeat;
	return true;
}