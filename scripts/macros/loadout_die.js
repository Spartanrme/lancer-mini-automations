import { getSpeaker } from "./macro_helpers.js";

/**
 * Runs the Loadout Die macro
 * See: https://github.com/Spartanrme/lancer-mini-automations/wiki#loadout-dice
 */
export async function runLoadoutDie(){
    // Cancel the macro if no token is selected
    if(canvas.tokens.controlled.length != 1)
        return ui.notifications.error("Select 1 token. You have " + canvas.tokens.controlled.length + " selected.");

    let token = canvas.tokens.controlled[0];

    // Get the current socket
    let socket = game.modules.get('lancer-mini-automations').socket;

    // Icon names and paths
    let dieId = "loadout_die";
    let diePath = CONFIG.statusEffects.find(x => x.id === dieId).icon; // filepath of icon

    // Set icon if not set
    if(!token.document.hasStatusEffect(dieId)){
        await socket.executeAsGM("updateTokenCondition", token.id, dieId, false);
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
                actor: await getSpeaker()
            }),
            content: msgContent 
        });
    }else{
        //await socket.executeAsGM("updateTokenCondition", token.id, dieId, false);
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