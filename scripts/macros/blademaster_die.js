import { getSpeaker } from "./macro_helpers.js";

export async function runBlademasterDie(){
    // Cancel the macro if no token is selected
    const token = canvas.tokens.controlled[0];
    let socket = game.modules.get('lancer-mini-automations').socket;

    if(!token)
        return ui.notifications.error("Select 1 token. You have " + canvas.tokens.controlled.length + " selected.");

    // Button values
    const increment = "inc";
    const parry = "parry";
    const deflect = "deflect";
    const feint = "feint";
    const trip = "trip";

    // Icon names and paths
    const dieId = "blademaster_die";
    const diePath = CONFIG.statusEffects.find(x => x.id === dieId).icon; // filepath of icon

    // Get the count of the die
    let count = await EffectCounter.findCounterValue(token.document, diePath) ?? 0;

    // Disable buttons if no die count
    let buttonsEnabled = ``;
    if(count < 1){
        buttonsEnabled = `disabled`;
    }

    // HTML body for the dialog window
    let htmlFormContent = `<form class="lancer accdiff window-content">
    <div class="flexrow lancer-border-primary" style="padding-bottom: 4px;"><b>Current count: ${count}</b></div>
    <div class="flexrow lancer-border-primary" style="padding-bottom: 4px;">
        <div class="flexcol">
            <button name="dmgType" value="${increment}" type="button" style="background-color: #333333; color: white;">
                <i class="fa-solid fa-arrow-up" style="color:white"></i></br>Increment Die
            </button>
        </div>
    </div>
    <div class="flexrow" style="padding-top: 4px;"><b>Use Die</b></div>
    <div class="flexrow" style="padding-top: 4px;">
        <div class="flexcol">
            <button name="dmgType" value="${parry}" type="button" style="background-color: #333333; color: white;" ${buttonsEnabled}>
                <i class="fa-solid fa-otter" style="color:white"></i></br>Parry
            </button>
        </div>
        <div class="flexcol">
            <button name="dmgType" value="${deflect}" type="button" style="background-color: #333333; color: white;" ${buttonsEnabled}>
                <i class="fa-solid fa-person-walking-arrow-loop-left" style="color:white"></i></br>Deflect
            </button>
        </div>
        <div class="flexcol">
            <button name="dmgType" value="${feint}" type="button" style="background-color: #333333; color: white;" ${buttonsEnabled}>
                <i class="fa-solid fa-person-falling-burst" style="color:white"></i></br>Feint
            </button>
        </div>
        <div class="flexcol">
            <button name="dmgType" value="${trip}" type="button" style="background-color: #333333; color: white;" ${buttonsEnabled}>
                <i class="fa-solid fa-car-side" style="color:white"></i></br>Trip
            </button>
        </div>
    </div>
    <div class="flexrow lancer-border-primary" style="padding-bottom: 4px;"></div>
    <div class="flexcol">
            <button name="dmgType" value="cancel" type="button" style="background-color: #333333; color: white;">
                <i class="cci cci-reticule i--l" style="color:white"></i></br>Close
            </button>
    </div>
    </form>`;

    // Content for the chat message. It is set to roll for if the user selects deflect which rolls d6s
    let chatObject = { 
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        speaker: ChatMessage.getSpeaker({
            actor: await getSpeaker()
        })
    };

    // Button click handler for main dialog window
    async function handleButtonClick(html, event) {
        const targetElement = event.currentTarget;
        let button = targetElement.value;
        
        // Chat Message Building
        let chatTitle = "Blademaster"
        let description = ""
                        
        switch(button){
            case increment:{
                // Apply icon if not already, then set to it to the default
                if(count < 3){
                    if(count < 1){
                        count++;
                        await socket.executeAsGM("updateTokenCondition", token.id, dieId, false);
                    }else{
                        count++;
                        await EffectCounter.findCounter(token, diePath).setValue(count);
                    }
                    // Chat
                    description = "Blademaster die incremented!";
                }else{
                    // Chat
                    description = "Blademaster die can't be incremented past 3!";
                }
                break;
            }
            case parry:{
                // Decrement die
                count--;
                await EffectCounter.findCounter(token, diePath).setValue(count);
                // Chat
                chatTitle += " PARRY";
                description = "As a reaction when you’re hit by a melee attack, you gain Resistance to all damage, heat, and burn dealt by the attack.";
                break;
            }
            case deflect:{
                // This one is a little more complicated. 
                // We gotta prompt for how many dice the user wants to use,
                // get that amount, roll that amount of dice, 
                // and then subtract that amount from the mech
                
                ui.activeWindow.close(); // close the main window so user doesn't select anything else

                let promptOptions = `<option value="0">0</option>`;
                
                // Build option list
                for (let i = 1; i <= count; i++) {
                    promptOptions += `<option value="${i}">${i}</option>`;
                }
                // Build dialog
                let promptBody =`
                                <label for="amount">Choose the amount of blademaster dice you want to use:</label>
                                <select name="Amount" id="amount"> 
                                    ${promptOptions}
                                </select>`;
                let result = await Dialog.prompt({
                    title: "Enter Deflect Amount",
                    content: promptBody,
                    label: "Confirm",
                    callback: (html) => {
                        return +html[0].querySelector("select").value ?? 0; }
                });

                // Roll however many dice were rolled.
                let roll = new Roll(result + "d6");
                let rolls = "You rolled: ";
                let success = false;
                await roll.evaluate();
                
                // Success logic 
                roll.dice[0].results.forEach(die => {
                    if(die.result >= 5){
                        success = true;
                    }
                    rolls += die.result + " ";
                });

                chatObject["rolls"] = [roll];

                // Decrement by how many dice were selected
                count -= result;
                await EffectCounter.findCounter(token, diePath).setValue(count);

                // Chat
                chatTitle += " DEFLECT";
                description = "As a reaction when you’re hit by a ranged attack, you may roll any number of Blademaster Dice, expending them: if you roll a 5+ on any of these dice, you gain Resistance to all damage, heat, and burn dealt by the attack.";
                if(success) description += " RESULT: SUCCESS (" + rolls + ")";
                else description += " RESULT: FAILURE (" + rolls + ")";
                break;
            }
            case feint:{
                // Decrement die
                count--;
                await EffectCounter.findCounter(token, diePath).setValue(count);
                // Chat
                chatTitle += " FEINT";
                description = "As a free action, choose an adjacent character: when moving, you ignore engagement and don’t provoke reactions from your target until the start of your next turn.";
                break;
            }
            case trip:{
                // Decrement die
                count--;
                await EffectCounter.findCounter(token, diePath).setValue(count);
                // Chat
                chatTitle += " TRIP";
                description = "As a quick action, choose an adjacent character: they must pass an Agility save or fall Prone. Whatever the result, you may freely pass through their space until the end of your current turn, although you can’t end your turn in their space.";
                break;
            }
            case "cancel":{
                // Close window
                ui.activeWindow.close();
                return null;
            }
        }
        
        // Build chat message 
        let msgContent = `<div class="card clipped-bot" style="margin: 0px;">
                            <div class="card clipped">
                            <div class="lancer-mini-header" >${chatTitle}</div>
                                <div class="lancer-mini-header"> // EFFECT // </div>
                            <div class="effect-text">
                                <ul>${description}</ul>
                            </div>
                            </div>
                        </div>`

        chatObject["content"] = msgContent;
        ChatMessage.create(chatObject);
        return button;
    }

    // Our main dialog
    async function promptForUse() {
    return new Promise(async (resolve) => {
        const dialog = new Dialog({
        title: "Blademaster Options",
        content: htmlFormContent,
        buttons: {},
        render: async (html) => {
            html.on('click', 'button[name="dmgType"]', async (event) => {
            let clickResult = await handleButtonClick(html, event);
            if (clickResult === null) {
                resolve(null);
                ui.activeWindow.close();
            } else if (typeof clickResult === "string") {
                resolve(clickResult);
                ui.activeWindow.close();
            } else {
                resolve(null);
                ui.activeWindow.close();
            }
            });
        },
        close: () => {
            resolve('User closed the window.');
        },
        });
        dialog.render(true);
    });
    }

    // We want to refresh the window everytime increment is selected
    let use = increment;
    while(use === increment){
        use = await promptForUse();
        // Update count & HTML
        // This is messy but I dunno how else to do it right now
        count = EffectCounter.findCounterValue(token.document, diePath) ?? 0;
        if(count < 1){
            buttonsEnabled = `disabled`;
        }else buttonsEnabled = ``;
        htmlFormContent = `<form class="lancer accdiff window-content">
    <div class="flexrow lancer-border-primary" style="padding-bottom: 4px;"><b>Current count: ${count}</b></div>
    <div class="flexrow lancer-border-primary" style="padding-bottom: 4px;">
        <div class="flexcol">
            <button name="dmgType" value="${increment}" type="button" style="background-color: #333333; color: white;">
                <i class="fa-solid fa-arrow-up" style="color:white"></i></br>Increment Die
            </button>
        </div>
    </div>
    <div class="flexrow" style="padding-top: 4px;"><b>Use Die</b></div>
    <div class="flexrow" style="padding-top: 4px;">
        <div class="flexcol">
            <button name="dmgType" value="${parry}" type="button" style="background-color: #333333; color: white;" ${buttonsEnabled}>
                <i class="fa-solid fa-otter" style="color:white"></i></br>Parry
            </button>
        </div>
        <div class="flexcol">
            <button name="dmgType" value="${deflect}" type="button" style="background-color: #333333; color: white;" ${buttonsEnabled}>
                <i class="fa-solid fa-person-walking-arrow-loop-left" style="color:white"></i></br>Deflect
            </button>
        </div>
        <div class="flexcol">
            <button name="dmgType" value="${feint}" type="button" style="background-color: #333333; color: white;" ${buttonsEnabled}>
                <i class="fa-solid fa-person-falling-burst" style="color:white"></i></br>Feint
            </button>
        </div>
        <div class="flexcol">
            <button name="dmgType" value="${trip}" type="button" style="background-color: #333333; color: white;" ${buttonsEnabled}>
                <i class="fa-solid fa-car-side" style="color:white"></i></br>Trip
            </button>
        </div>
    </div>
    <div class="flexrow lancer-border-primary" style="padding-bottom: 4px;"></div>
    <div class="flexcol">
            <button name="dmgType" value="cancel" type="button" style="background-color: #333333; color: white;">
                <i class="cci cci-reticule i--l" style="color:white"></i></br>Close
            </button>
    </div>
    </form>`;
    }
}