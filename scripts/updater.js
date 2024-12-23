/**
 * Update "token" based on args
 * @param {number} tokenId 
 * @param {string, number} args 
 */
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

/**
 * Updates which player has ownership of a token.
 * @param {number} tokenId 
 * @param {object} owner 
 */
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

/**
 * Add or replaces a token's condition.
 * @param {number} tokenId 
 * @param {number} conditionId 
 * @param {bool} replace 
 */
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
        if(actor.document.hasStatusEffect(conditionId)){
            return;
        }else{
            await actor.document.toggleActiveEffect(effect);
        }
    }
}