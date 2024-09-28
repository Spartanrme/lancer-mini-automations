import { getSpeaker } from "./macro_helpers.js";

export async function runLoadoutDie(socket){
    // Cancel the macro if no token is selected
    if(canvas.tokens.controlled.length != 1)
        return ui.notifications.error("Select 1 token. You have " + canvas.tokens.controlled.length + " selected.");

    // Icon names and paths
    let dieId = "loadout_die";
    let diePath = CONFIG.statusEffects.find(x => x.id === dieId).icon; // filepath of icon

    // Set icon if not set
    if(!token.document.hasStatusEffect(dieId)){
        await game.macros.getName("toggleCondition").execute({tokenId:token.id, condition:dieId, replace:false});
        await EffectCounter.findCounter(token, diePath).setValue(6);
    }

    // Chat items
    let chatTitle = "Loadout";
    let description = "";

    // Get the count of the die
    let count = await EffectCounter.findCounterValue(token.document, diePath) ?? 0;

    // Decrement Die unless at 1, in which case reset it
    if(count > 1){
        await EffectCounter.findCounter(token, diePath).setValue((count - 1));
        description = "Loadout die decreased to " + (--count) + ".";
        if(count === 1){
            description += " Locked and Loaded (Free Action) is ready. The next time you run this macro, Locked and Loaded will be used and the die will reset to 6.";
        }
        let msgContent = `<div class="card clipped-bot" style="margin: 0px;">
                <div class="card clipped">
                    <div class="lancer-mini-header" >${chatTitle}</div>
                            <div class="lancer-mini-header"> // EFFECT // </div>
                            <div class="effect-text">
                                <ul>${description}</ul>
                            </div>
                </div>
                        </div>`
        ChatMessage.create({ 
            speaker: ChatMessage.getSpeaker({
                actor: game.macros.getName("Get-Speaker").execute()
            }),
            content: msgContent 
        });
    }else{
        await game.macros.getName("toggleCondition").execute({tokenId:token.id, condition:dieId, replace:false});
        await EffectCounter.findCounter(token, diePath).setValue(6);
        // Chat Message
        description = "Reroll 1 attack, check, or save, though the second result must be kept.";
        let msgContent = `<div class="card clipped-bot" style="margin: 0px;">
                    <div class="card clipped">
                        <div class="lancer-mini-header" >${chatTitle}</div>
                                <div class="lancer-mini-header"> // EFFECT // </div>
                                <div class="effect-text">
                                    <ul>${description}</ul>
                                </div>
                    </div>
                        </div>`
        ChatMessage.create({ 
            speaker: ChatMessage.getSpeaker({
                actor: await getSpeaker()
            }),
            content: msgContent });
    }
}