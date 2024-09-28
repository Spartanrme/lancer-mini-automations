// This macro returns the actor that a player is speaking as (what they have selected) if they have permissions to it, or themselves if they have nothing selected. This macro is meant to be run within the ChatMessage method:
/*
EXAMPLE:
ChatMessage.create({
    speaker: ChatMessage.getSpeaker({
    actor: game.macros.getName("Get-Speaker").execute()
}),
*/
export async function getSpeaker(){
    try{
        let ownerObject = await canvas.tokens.controlled[0].actor.ownership
            //console.log(ownerObject)
            let ownerIDCode = ""
            for (let [key, value] of Object.entries(ownerObject)) {
                if (key == "default") {
                    console.debug("Default. Ignoring...")
                } else if (game.users.filter(u => u.isGM).map(u => u.id).includes(key)) { 
                    console.debug("GM user. Ignoring...")
                } else {
                    if (value == 3) {
                        console.debug(`${key} is the ID of the owner.`)
                        ownerIDCode = key
                    }
                }
            }
        
        let ownerUser = game.users.get(ownerIDCode)	
        let myActor = ownerUser.character || game.user.character || canvas.tokens.controlled[0].actor;
        return myActor;
    }
    catch{
        return null;
    }
}

export async function getAliveNpcCount(token){
    let count = 0;

    token.actor.system.loadout.systems.forEach(system =>{
            if(system?.value?.name?.includes("NHP")
            && !system?.value?.system?.destroyed){
                count++;
            }
        });

    return count;
}

/*
This macro runs through an NPCs items and matches (using regex) all items containing reactions.
*/
export async function getNpcDamageReactions(token){
let reactions = [];
    // Exit if nothing is selected or if the token type isn't 'npc'
    if(!token || token.actor.type != "npc"){
        return reactions;
    }

    // Get all the NPC items
    let items = token.actor.items;
    let keywords = /Hit|Hits|Damage|Damages/i;

    // Run through each NPC's items
    items.forEach(x =>{
        let system = x.system;
        
        // We want to filter by the following things:
        // 1) It isn't destroyed
        // 2) It is a reaction
        if(foundry.utils.hasProperty(system, "trigger") 
            && system.destroyed != true
            && system.type === "Reaction"
            && system.trigger.match(keywords) != null) {
                reactions.push(system.trigger);
        }
    });
    return reactions;
}

/*
This macro runs through an NPCs items and matches (using regex) all items containing reactions.
*/
export async function getNpcDamageReductions(token){
    let reactions = [];
    // Exit if nothing is selected or if the token type isn't 'npc'
    if(!token || token.actor.type != "npc"){
        return reactions;
    }

    // Get all the NPC items
    let items = token.actor.items;
    let keywords = /Hit|Hits|Damage|Damages/i;

    // Run through each NPC's items
    items.forEach(x =>{
        let system = x.system;
        
        // We want to filter by the following things:
        // 1) It isn't destroyed
        // 2) It is a reaction
        if(foundry.utils.hasProperty(system, "trigger") 
            && system.destroyed != true
            && system.type === "Reaction"
            && system.trigger.match(keywords) != null) {
                reactions.push(system.trigger);
        }
    });
    return reactions;
}

export async function getTalentRank(talentName){
    if(canvas.tokens.controlled.length !=  1)
        return ui.notifications.info("Please select only one token!");

    let itemMap = await canvas.tokens.controlled[0].actor.system.pilot.value.items.contents;

    let modId = "";
    let modIndex = 0;
    for (let i = 0; i < itemMap.length; i++) {
        let moduleName = await itemMap[i].name;
        if (moduleName === talentName) {
            return itemMap[i].system.curr_rank;
        };
    };

    return 0;
}