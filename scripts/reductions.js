// Automation for halving heat if the actor has a status named "Resist Heat"
export async function resistHeat(state, updates){
	// Exit if no updates to heat were detected
	if(!foundry.utils.hasProperty(updates, "system.heat")){
		return;
	}
	// Exit if actor doesn't have the resist heat status
	if(!state.statuses.has("resist_heat")){
		return;
	}
	let currentHeat = state.system.heat.value; 
	let updateHeat = updates.system.heat.value;
	// Get how much the heat was updated by
	let tempHeat = updateHeat - currentHeat;
	// Don't reduce
	if(tempHeat <= 0){
		return;
	}else{
		// Half the heat round up
		tempHeat = Math.ceil(tempHeat / 2);
		// Add to current heat
		tempHeat += currentHeat;
	}
	//console.log("Current: "+currentHeat); 
	//console.log("Update: "+updateHeat);
	//console.log("Temp: " + tempHeat);
	updates.system.heat.value = tempHeat;
}