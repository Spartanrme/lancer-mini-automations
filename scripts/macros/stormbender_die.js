import { getSpeaker } from "./macro_helpers.js";

export async function runStormbendingDie(){
    // Cancel the macro if no token is selected
    if(canvas.tokens.controlled.length != 1)
        return ui.notifications.error("Select 1 token. You have " + canvas.tokens.controlled.length + " selected.");

    let token = canvas.tokens.controlled[0];

    // Get the current socket
    let socket = game.modules.get('lancer-mini-automations').socket;
    
    // Icon names and paths
    let dieId = "torrent_die";
    let diePath = CONFIG.statusEffects.find(x => x.id === dieId).icon; // filepath of icon

    // Set icon if not set
    if(!token.document.hasStatusEffect(dieId)){
        await socket.executeAsGM("updateTokenCondition", token.id, dieId, false);
        await EffectCounter.findCounter(token, diePath).setValue(6);
    }

    // Chat items
    let chatTitle = "Stormbending";
    let description = "";

    // Get the count of the die
    let count = await EffectCounter.findCounterValue(token.document, diePath) ?? 0;

    // Decrement Die unless at 1, in which case reset it
    if(count > 1){
        await EffectCounter.findCounter(token, diePath).setValue((count - 1));
        description = "Torrent die decreased to " + (--count) + ".";
        if(count === 1){
            description += " Massive Attack (Full Action) is ready. The next time you run this macro, Massive Attack will be used and the die will reset to 6.";
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
        await EffectCounter.findCounter(token, diePath).setValue(6);
        // Chat Message
        // Get save target for mech
        let saveTarget = token.actor.system.save;
        description = "Reset your Torrent Die to 6, then target a character within line of sight and Range 15: they must succeed on an Agility save (DC:" + saveTarget + ") or take [[2d6]] Explosive damage, become Stunned until the end of their next turn, and be knocked Prone. On a success, they take half damage and are knocked Prone but not Stunned.";
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