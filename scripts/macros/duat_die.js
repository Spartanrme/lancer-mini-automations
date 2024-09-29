export async function runDuatDie(state, socket){
    if(await game.settings.get('lancer-mini-automations', 'enableDuatAutomation') === false){
        return false;
    }
    // Targets (just use the first)
    const target = game.user.targets.first();
    const token = canvas.tokens.controlled[0];

    // Cancel the macro if no target is selected
    if(!target)
        return false;
    // Cancel the macro if no token is selected
    if(!token)
        return false;
    // Before we do anything, did it hit?
    if(!state?.state?.data?.hit_results[0]?.hit)
        return false;        
    // Is this the duat tech attack?
    if(state?.state?.data?.action?.name.localeCompare("Hurl Into the Duat") != 0)
        return false;

    // Icon names and paths
    let dieId = "duat_gate";
    let diePath =  CONFIG.statusEffects.find(x => x.id === dieId).icon;// filepath of icon
    
    // Our Duat Count
    let count = 0;
    
    // Need to apply icon before SIC can work
    // This also means we are at the first stage
    if(!token.document.hasStatusEffect(dieId)){
        await socket.executeAsGM("updateTokenCondition", token.id, dieId, false);
        await EffectCounter.findCounter(token, diePath).setValue(1); // Set icon to 1 to represent the first stage
    }
    
    count = await EffectCounter.findCounterValue(token.document, diePath) ?? 0;
    
    // On each hit, increase heat by two
    let heat = target.actor.system.heat.value;
    let updateValues = ["system.heat.value", (heat+2)];
    await socket.executeAsGM("updateToken", target.id, updateValues);
    
    // Chat Options
    let chatTitle = "";
    let description = "";
    // Add token image to list
    let tokenImages = ` 
                        <div>
                            <img class="lancer-hit-thumb" src="${target.actor.img}"/>
                        </div>`;
                    
    switch(count){
        case 0:{
            // how'd we get here?
            return ui.notifications.error("I AM PANICING AAAAAAAHHHHHH");
        }
        case 1:{
            // First Stage
            chatTitle = "// FIRST GATE //";
            description = "Target's next standard movement is now under player control.";
            
            // Finally, increment the counter
            count++;
            await EffectCounter.findCounter(token, diePath).setValue(count);
            break;
        }
        case 2:{
            // Second Stage
            // Inflict Slowed and Impaired
            await socket.executeAsGM("updateTokenCondition", target.id, "slow", false);
            await socket.executeAsGM("updateTokenCondition", target.id, "impaired", false);
            chatTitle = "// SECOND GATE //";
            description = "Target is impaired and slowed until the end of their next turn.";
            
            // Finally, increment the counter
            count++;
            await EffectCounter.findCounter(token, diePath).setValue(count);
            break;
        }
        case 3:{
            // Third Stage
            // Inflict Stunned
            await socket.executeAsGM("updateTokenCondition", target.id, "stunned", false);
            chatTitle = "// THIRD GATE //";
            description = "Target is stunned until the end of their next turn.";
            
            // Finally, increment the counter
            count++;
            await EffectCounter.findCounter(token, diePath).setValue(count);
            break;
        }
        case 4:{
            // Fourth Stage
            // Change NPC to be controlled by the player
            await socket.executeAsGM("updateTokenCondition", target.id, dieId, false);
            await socket.executeAsGM("updateTokenOwnership", target.id, foundry.CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER);
            
            chatTitle = "// FOURTH GATE //";
            description = "Target is now an ally until the end of their next turn.";
            
            // Finally, reset the counter to 1.
            count = 1;
            await EffectCounter.findCounter(token, diePath).setValue(count);            
            break;
        }
    }
    // Chat Message
    let msgContent = `<div class="card clipped-bot" style="margin: 0px;">
                <div class="card clipped">
                    <div class="lancer-mini-header" >${chatTitle}</div>
                            <div class="lancer-mini-header"> // EFFECT // </div>
                            <div class="effect-text">
                                <ul>${description}</ul>
                            </div>
                        <div class="lancer-hit">
                            <span>${tokenImages}</span>
                            <div class="lancer-hit-text">
                                <span class="lancer-hit-text-name"> has taken 2 <i class="cci cci-heat i--m damage--energy"></i></span>
                            </div>
                        </div>
                    </div>
                </div>`
    ChatMessage.create({ content: msgContent });   
}