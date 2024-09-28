// Update "token" based on args
// args: a tuple [string, number] where string is the update path and number is the update value
export async function updateToken(tokenId, args){
    // Nothing to update
    if(args === null){
        return;
    }
    // Get token
    let token = await canvas.tokens.placeables.find(x => x.id === tokenId);

    if(token === undefined) return console.error("Cannot find token to update.");

    // Update the token with args
    await token.actor.update({
        [args[0]]:args[1]
    });
}

export async function updateTokenOwnership(tokenId, owner){
    // Get token
    let target = await canvas.tokens.placeables.find(x => x.id === tokenId);

    if(target === undefined){
        return ui.notifications.error("No target to update ownership of!");
    }

    const update = {default: owner};
    // loop accounts for if player has preexisting lower perms
    for(const id of game.users.keys()){
        update[id] = owner;
        await target.actor.update({ownership: update});
    }
}

export async function updateTokenCondition(tokenId, conditionId, replace = false){
    // Find the effect
    const effect = CONFIG.statusEffects.find(e => e.id === conditionId);
    if (effect === undefined) 
        return console.error("No effect with id \"" + conditionId + "\" found.");

    // Get the token
    let actor = await canvas.tokens.placeables.find(x => x.id === tokenId);
    if (actor === undefined) 
        return console.error("Cannot find token to update: " + tokenId);

    if(replace){
        await actor.document.toggleActiveEffect(effect);
    }else{
        if(actor.document.hasStatusEffect(effect)){
            return;
        }
        await actor.document.toggleActiveEffect(effect);
    }
}