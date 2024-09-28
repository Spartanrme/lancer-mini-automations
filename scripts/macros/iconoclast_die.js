import { getSpeaker } from "./macro_helpers.js";
import { getAliveNpcCount } from "./macro_helpers.js";

export async function runIconoclastDie(){
    // Cancel the macro if no token is selected
    if(canvas.tokens.controlled.length != 1)
        return ui.notifications.error("Select 1 token. You have " + canvas.tokens.controlled.length + " selected.");

    let token = canvas.tokens.controlled[0];

    // Get the current socket
    let socket = game.modules.get('lancer-mini-automations').socket;

    // Icon names and paths
    const dieId = "transcendence_die";
    const diePath = CONFIG.statusEffects.find(x => x.id === dieId).icon;
    const transId = "transcendence";
    const transPath = CONFIG.statusEffects.find(x => x.id === transId).icon;

    // Need to apply icon before SIC can work
    // This also means we are at the first stage
    if(!token.document.hasStatusEffect(dieId)){
        await socket.executeAsGM("updateTokenCondition", token.id, dieId, false);
        await EffectCounter.findCounter(token, diePath).setValue(3); // Set icon to 3 for Iconoclast 3
    }

    // Fire this if user clicks memetic spark button
    async function performMemeticSpark(html){
        // Memetic Spark
        let range = 3;
        let damage = 1;
        let bonusText = "";

        // Apply damage increases
        let nhpCount = await getAliveNpcCount(token); // We don't need to call it on a socket
        damage += nhpCount;

        // Apply Transcendence Effects
        if(token.document.hasStatusEffect(transId)){
            damage += 4;
            range += 5;
            bonusText += " and +4 damage for Transcendence"
        }

        // Apply resistance
        if(html[0].querySelector("input[name='resistance']:checked")){
            damage = Math.ceil(damage / 2);
            bonusText += " and halved for resistance";
        }

        // Get the count of the die
        let count = await EffectCounter.findCounterValue(token.document, diePath) ?? 3;
        // Check if it is above 3, if it is reset it to 3.
        if(count > 3){
            count = 3;
            await EffectCounter.findCounter(token, diePath).setValue(count);
        }

        // Place line template
        // Memetic spark isn't a line but I AM LAZY so line 0
        const template = await game.lancer.canvas.WeaponRangeTemplate.fromRange({
            type: "Blast",
            val: 0,
        }).placeTemplate()

        // If the template is placed, lets continue
        if (template) {
            // Get the targets from the template
            game.lancer.targetsFromTemplate(template.id);
            let target = game.user.targets.first();
            
            // Effects we are going to use
            await Sequencer.Preloader.preloadForClients([
                "modules/lancer-weapon-fx/soundfx/NexusFire.ogg",
                "jb2a.lightning_bolt.wide.blue",
            ]);

            //Sequencer
            let sequence = new Sequence();
            sequence
                .sound()
                    .file("modules/lancer-weapon-fx/soundfx/NexusFire.ogg")
                    .delay(500)
                    .volume(game.modules.get("lancer-weapon-fx").api.getEffectVolume(0.5));
            sequence
                .effect()
                    .atLocation(target)
                    .file('modules/JB2A_DnD5e/Library/Generic/Lightning/LightningStrike01_01_Regular_Blue_800x800.webm')
                    .randomizeMirrorX()
                    .randomizeMirrorX()
                    .name("bolt")
                    .scale(1.5)
                    .addOverride(async (effect, data) => {
                        if(damage === 5){
                            data["tint"] = "#FF0000";
                        }
                        return data;
                    })
            sequence.play();

            // Do damage to targetted tokens
            let tokenImages = await doDamage(damage);

            // Chat Message
            let chatTitle = "MEMETIC SPARK"
            let msgContent = `
                            <div class="lancer-header lancer-weapon medium">
                                <i class="cci cci-weapon i--m i--light"> </i>
                                <span>${chatTitle}</span>
                            </div>
                            <div class="card clipped-bot" style="margin: 0px;">
                                <div class="mini-weapon-profile flexrow">
                                    <div class="mini-weapon-profile-range flexrow">
                                        <span data-tooltip="Range"><i class="cci cci-range"></i>${range}</span>
                                    </div>
                                    <span class="mini-weapon-profile-separator">//</span>
                                        <div class="mini-weapon-profile-damage flexrow">
                                            <span data-tooltip="Energy"><i class="cci cci-energy damage--energy"></i>${damage}</span>
                                        </div>
                                </div>
                                <div class="card clipped">
                                    <div class="lancer-mini-header" >// EFFECT //</div>
                                        <div class="lancer-hit">
                                            <span>(Added +${nhpCount} damage for ${nhpCount} alive NHPs${bonusText})</span>
                                        </div>
                                        <div class="lancer-hit">
                                            <span>${tokenImages}</span>
                                            <div class="lancer-hit-text">
                                                    <span class="lancer-hit-text-name"> has taken ${damage} AP <i class="cci cci-energy i--m damage--energy"></i></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>`
            ChatMessage.create({ content: msgContent });

            ui.notifications.info("Now perform Transmuting spark.");
            await performTransmutingSpark(html);
        }
    }

    // Fire this if user clicks transmuting spark button
    async function performTransmutingSpark(html){
        // Transmuting Spark
        let range = 3; // size of line
        let damage = 2; // damage number to display

        // Resistance
        if(html[0].querySelector("input[name='resistance']:checked")){
            damage = 1;
        }
        
        // Get the count of the die
        let count = EffectCounter.findCounterValue(token.document, diePath) ?? 3;
        // Check if it is above 3, if it is reset it to 3.
        if(count > 3){
            count = 3;
            await EffectCounter.findCounter(token, diePath).setValue(count);
        }
        
        // Place line template
        ui.notifications.info("Remember you can rotate the line using the mouse wheel.")
        const template = await game.lancer.canvas.WeaponRangeTemplate.fromRange({
            type: "Line",
            val: range,
        }).placeTemplate()

        // If the template is placed, lets continue
        if (template) {
            // Get the targets from the template
            game.lancer.targetsFromTemplate(template.id);

            // Decrease the transcendence die
            await decrementDie(count);
            
            // Effects we are going to use
            await Sequencer.Preloader.preloadForClients([
                "modules/lancer-weapon-fx/soundfx/NexusFire.ogg",
                "jb2a.lightning_bolt.wide.blue",
            ]);

            //Sequencer
            let sequence = new Sequence();
            sequence
                .sound()
                    .file("modules/lancer-weapon-fx/soundfx/NexusFire.ogg")
                    .delay(1000)
                    .volume(game.modules.get("lancer-weapon-fx").api.getEffectVolume(0.5));
            sequence
                .effect()
                    .file("jb2a.lightning_bolt.wide.blue")
                    .scale(.5)
                    .atLocation(token)
                    .startTime(0)
                    .rotateTowards(template)
                    .name("bolt")
                    .addOverride(async (effect, data) => {
                        if((token.document.hasStatusEffect(transId))){
                            data["tint"] = "#FF0000";
                        }
                        return data;
                    })
            sequence.play();

            // Do damage to targetted tokens
            let tokenImages = await doDamage(damage);

            // Chat Message
            let chatTitle = "TRANSMUTING SPARK"
            let msgContent = `
                            <div class="lancer-header lancer-weapon medium">
                                <i class="cci cci-weapon i--m i--light"> </i>
                                <span>${chatTitle}</span>
                            </div>
                            <div class="card clipped-bot" style="margin: 0px;">
                                <div class="mini-weapon-profile flexrow">
                                    <div class="mini-weapon-profile-range flexrow">
                                        <span data-tooltip="Range"><i class="cci cci-range"></i>${range}</span>
                                    </div>
                                    <span class="mini-weapon-profile-separator">//</span>
                                        <div class="mini-weapon-profile-damage flexrow">
                                            <span data-tooltip="Energy"><i class="cci cci-energy damage--energy"></i>${damage}</span>
                                        </div>
                                </div>
                                <div class="card clipped">
                                    <div class="lancer-mini-header" >// EFFECT //</div>
                                        <div class="lancer-hit">
                                            <span>${tokenImages}</span>
                                            <div class="lancer-hit-text">
                                                    <span class="lancer-hit-text-name"> has taken ${damage} AP <i class="cci cci-energy i--m damage--energy"></i></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>`
            ChatMessage.create({ content: msgContent });
        }
    }

    // Helper function so we aren't repeating a lot of code
    // Accounts for overshield
    // params: damage (number)
    // returns the list of token images that were damaged
    async function doDamage(damage){
        // Setup images of tokens targetted.
        let tokenImages = ``;
        // Do Damage to Targets
        for(let target of game.user.targets){
            // Don't target self
            if(target.id === token.id){
                break;
            }
            // Damage Overshield
            let overshield = target.document.actor.system.overshield.value;
            let hp = target.document.actor.system.hp.value;
            let overshieldRemain = overshield - damage;
            let tempdamage = damage;

            if (overshield > 0 && overshieldRemain >= 0) {
            //case 1 - has overshield, damage doesn't break shield
            let updateValues = ["system.overshield", overshieldRemain];
            socket.executeAsGM("updateToken", target.id, updateValues);
            tempdamage = 0;

            } else if (overshield > 0 && overshieldRemain < 0) {
            //case 2: has overshield, damage breaks overshield and deals real damage
            overshieldRemain = 0;
            let updateValues = ["system.overshield", overshieldRemain];
            socket.executeAsGM("updateToken", target.id, updateValues);
            tempdamage = tempdamage - overshield;
            }
            // Update HP
            // Run structure if HP would go below zero
            if(target.document.actor.system.structure.value == 1 && hp - tempdamage <= 0){
                let updateValues = ["system.hp.value", 0];
                socket.executeAsGM("updateToken", target.id, updateValues);
            }
            else{
                let updateValues = ["system.hp.value", (hp - tempdamage)];
                socket.executeAsGM("updateToken", target.id, updateValues);
            }
            // Add token image to list
            tokenImages += `<div>
                    <img class="lancer-hit-thumb" src="${target.actor.img}"/>
                </div>`
        }
        return tokenImages;
    }

    // Helper function to decrement the die
    // Doesn't decrement while transcendence is active
    // params:
    // count (number) - the current count of the transcendence die
    async function decrementDie(count){
        // Decrement Transcendence Die unless in Transcendence
        if(count != 1 && !token.document.hasStatusEffect(transId)){
            count--;
            await EffectCounter.findCounter(token, diePath).setValue(count);
        }else if(!token.document.hasStatusEffect(transId)){
            // Apply Transcendence
            count = 3;
            await EffectCounter.findCounter(token, diePath).setValue(count);
            await socket.executeAsGM("updateTokenCondition", token.id, transId, false);
        }
    }

    // Our main dialog
    let d = new Dialog({
    title: "Iconoclast",
    content:`
                <p><span class=horus--subtle><i>ARE DREAMS AND REALITY REALLY SO UNLIKE?</i></span></p>
                <p><span class=horus--subtle><i>CHOOSE</i></span></p>
                <div>
                    <input type="checkbox" value="resistance" name="resistance"/>
                    <label>Targets have energy resistance</label>
                </div>
                <div>
                    </br>
                </div>
            `,
    buttons: {
    transmuting: {
    label: "Perform Transmuting Spark",
    callback: async(html) => {
        await performTransmutingSpark(html);
    }
    },
    memetic: {
    label: "Perform Memetic Spark",
    callback: async(html) => {
        await performMemeticSpark(html);
    }
    }
    },
    default: "transmuting",
    render: html => console.log("Register interactivity in the rendered dialog"),
    close: html => console.log("This always is logged no matter which option is chosen")
    });
    d.render(true);
}