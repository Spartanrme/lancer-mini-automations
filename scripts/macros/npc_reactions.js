// This macro opens up a window with a list of all unique npc reactions that contain certain keywords, and their effects and associated NPC.
export async function displayNpcReactions(){
    // The keywords to search for in triggers
    let keywords = /allied|ally|move/;
    if(event.shiftKey) keywords = /./;

    let reactions = new Map();

    // Setup for Playerside information
    let isGm = game.user.isGM;
    let scanList = [];
    if(!isGm){
    // Get all scanned NPCs
    scanList = game.folders.getName("SCAN Database")?.contents ?? [];
    }

    game.scenes.current.tokens.forEach(x => {
        let actor = x.actor

        // Filter by NPCs
        if(actor.type === "npc"){
            let items = actor.items;
            
            // Run through each NPC's items
            items.forEach(x =>{
                let system = x.system;
                
                // We want to filter by the following things:
                // 1) It isn't destroyed
                // 2) It is a reaction
                // 3) It contains at least one of our keywords
                if(foundry.utils.hasProperty(system, "trigger") 
                    && system.destroyed != true
                    && system.type === "Reaction"
                    && system.trigger.match(keywords) != null) {
                        if(isGm || scanList.some(x => x.name.includes(actor.name) === true)){
                            reactions.set((actor.name + ": " + system.trigger), system.effect);
                        }
                }
            });
        }
    });

    // Setup dialog content
    let msgContent = `<ul>`;
    if(!event.shiftKey) msgContent = "<i>(Run this macro again while holding Shift for all Reactions)</i>" + msgContent;
    for (let entry of reactions.entries()) {
    msgContent += `<li>${entry[0]}
                    <ul><li>${entry[1]}</li></ul>
                    </li>`;
    }
    msgContent += `</ul>`;

    // Display the dialog
    let dialog = new Dialog({
    content: msgContent,
    title: "Reaction List (All NPCs on Current Scene)",
    buttons:{},
    }).render(true);
}