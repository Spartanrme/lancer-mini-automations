import { getNpcDamageReactions } from "./macro_helpers.js";
import { getNpcDamageReductions } from "./macro_helpers.js";

/*
!!This is a modfication of Carcosa's Apply Damage Macro from PILOT.NET Discord, all credit to them!!
Lancer Apply Damage Macro
Written by StarsofCarcosa#0440
(Modified by AnatoleSerial to work with Lancer system Version 2.0.3)

REQUIRES THE FOLLOWING MODULES TO FUNCTION:
- Math.js

Select (not target) any number of tokens and run the macro, which will bring up a small menu. Enter unmodified damage, check Resistance box if appropriate, and select damage type.

Kinetic/Energy/Explosive damage is all handled the same at the moment; tokens will take damage, accounting for armor.

Burn will pierce armor and also increment the Burn value.

Heat simply increments heat.

The GM recieves a whisper updating them on changed values, so it is easy to check that everything is correct and to revert damage done if necessary. You can disable this function by commenting out the chat code, near the bottom. The user of the macro will also recieve a UI notification containing the same info.

V2: Now accounts for overshield.

V3: some fixes

V3.3: Foundry V11 Compatiable (Thanks AnatoleSerial for doing the entire upgrade)

V3.4: Removed Warpgate dependency, now relies only on foundry dialog! (Thanks again to AnatoleSerial for handling the entire upgrade!)
    - additionally, some additional integration with the auto-damage macro has been added- will now color the appropriate damage type when using the auto-damage macro.
    
V3.4b: Added additional customization for damage types that may be sent from the Auto Apply Damage macro. Color codes and changes icon of damage button based on damage type.

V4: Remove exposed button and leverage the exposed status itself. 
-  Swap to 'scope' from 'args'.  V11 fix.
-  Convert to if/elif to switch/case statement.
-  color enhancements if called with arguments

V5: Major overhaul to refactor things.
-   Moved the damage stuff to a function to better scope variables
-   Change from a large if/else if to single block (DRY)
-   Added Shredded calculations
*/
async function applyDamage(dmg = 0, type = null, windowCount = 1, windowTotal = 1){
    let defaultButtonStyle = "opacity:1"; // Default button style: fully opaque
    let transparentButtonStyle = "opacity:0.1"; // Inactive button style: 10% opacity
    let weaponButtonStyle = defaultButtonStyle; // Style for the weapon button
    let burnButtonStyle = defaultButtonStyle; // Style for the burn button
    let heatButtonStyle = defaultButtonStyle; // Style for the heat button
    let weaponIconStyle = "color:white"; // Default weapon icon: white
    let weaponIcon = "cci cci-reticule i--l"; // Default icon for weapon
    let windowText = `<div class="flexcol">${windowCount}/${windowTotal}</div>`; // Display how many windows there are
    const socket = game.modules.get('lancer-mini-automations').socket;

    // All button text will always be white
    const buttonTextStyle = "color:white;";

    // Adjust styles based on the damage type passed
    if (type) {
        switch (type) {
            case 'kinetic':
                weaponIconStyle = "color:#616161;"; // Activated color for kinetic damage
                weaponIcon = "cci cci-kinetic i--l";
                burnButtonStyle = transparentButtonStyle; // Inactive buttons are 10% transparent
                heatButtonStyle = transparentButtonStyle;
                break;
            case 'energy':
                weaponIconStyle = "color:#2195ca;"; // Activated color for energy damage
                weaponIcon = "cci cci-energy i--l";
                burnButtonStyle = transparentButtonStyle;
                heatButtonStyle = transparentButtonStyle;
                break;
            case 'explosive':
                weaponIconStyle = "color:#fca017;"; // Activated color for explosive damage
                weaponIcon = "cci cci-explosive i--l";
                burnButtonStyle = transparentButtonStyle;
                heatButtonStyle = transparentButtonStyle;
                break;
            case 'burn':
                burnButtonStyle = defaultButtonStyle; // Burn button is fully visible
                weaponButtonStyle = transparentButtonStyle; // Inactive weapon button
                heatButtonStyle = transparentButtonStyle;
                weaponIcon = "cci cci-reticule i--l"; // Inactive icon is white
                break;
            case 'heat':
                heatButtonStyle = defaultButtonStyle; // Heat button is fully visible
                weaponButtonStyle = transparentButtonStyle; // Inactive weapon button
                burnButtonStyle = transparentButtonStyle;
                weaponIcon = "cci cci-reticule i--l"; // Inactive icon is white
                break;
        }
    }

    // NPC damage reductions & reactions
    let uiNpcReductions = ``;
    if(canvas.tokens.controlled.length === 1){
        let token = canvas.tokens.controlled[0];
        let npcReductions = await getNpcDamageReductions(token);
        // Reductions
        for(let i = 0; i < npcReductions.length; i++){
            let dots = "";
            if(npcReductions[i].length > 75)
                dots = "..."
            uiNpcReductions += `<label><span>--` + npcReductions[i].substring(0, 75) + dots + `</span></label>`;
        }
        // Reactions
        let npcReactions = await getNpcDamageReactions(token);
        for(let i = 0; i < npcReactions.length; i++){
            let dots = "";
            if(npcReactions[i].length > 75)
                dots = "..."
            uiNpcReductions += `<label><span>--Reaction: ` + npcReactions[i].substring(0, 75) + dots + `</span></label>`;
        }
    }else uiNpcReductions += `<i>Multiple tokens selected</i>`;

    const htmlFormContent = `<form class="lancer accdiff window-content">
        <div class="flexrow lancer-border-primary" style="padding-bottom: 4px;">
            <div class="flexcol">
                <label class="container">
                    <h3 class="lancer-border-primary">Damage</h3>
                    <input type="number" value=${dmg} name="damage_amount" class="lancer-text-field grow"
                    style="color:var(--color-text-dark-primary, black); text-align: center;"/>
                </label>
                <label class="container">
                    <i>(Don't subtract armor)</i>
                </label>
                ${uiNpcReductions}
            </div>
            <div class="flexcol">
                <h3 class="lancer-border-primary">Modifiers</h3>
                <label class="container" style="order: 2;">
                    <input type="checkbox" name="has_resistance">
                    <span class="checkmark">Resistance</span>
                </label>
                <label class="container" style="order: 1;">
                    <input type="checkbox" name="attack_is_piercing"> Armor Piercing
                </label>
            </div>
        </div>
        <div class="flexrow" style="padding-top: 4px;">
            <div class="flexcol">
                <button name="dmgType" value="Weapon" type="button" style="background-color: #333333; ${weaponButtonStyle}">
                    <i class="${weaponIcon}" style="${weaponIconStyle}"></i></br>
                    <span style="${buttonTextStyle}">Damage</span>
                </button>
            </div>
            <div class="flexcol">
                <button name="dmgType" value="Burn" type="button" style="background-color: #333333; ${burnButtonStyle}">
                    <i class="cci cci-burn i--l" style="color:#ce871e;"></i></br>
                    <span style="${buttonTextStyle}">Burn</span>
                </button>
            </div>
            <div class="flexcol">
                <button name="dmgType" value="Heat" type="button" style="background-color: #333333; ${heatButtonStyle}">
                    <i class="cci cci-heat i--l" style="color:#e74210;"></i></br>
                    <span style="${buttonTextStyle}">Heat</span>
                </button>
            </div>
        </div>
        ${windowText}
    </form>`;

    function handleButtonClick(html, event) {
        const targetElement = event.currentTarget;
        const presetType = targetElement.dataset?.preset;

        const formElement = $(targetElement).parents('form');
        const damage = parseInt(formElement?.find('[name="damage_amount"]').val());
        const resistDmg = formElement?.find('[name="has_resistance"]').prop("checked");
        const armorPiercing = formElement?.find('[name="attack_is_piercing"]').prop("checked");

        const selectedTokens = canvas.tokens.controlled;

        if (typeof damage !== "number") {
            return "Damage must be a number.";
        }

        const attackType = targetElement.value;

        if (!isNaN(damage) && damage > 0) {
            selectedTokens.forEach(token => {
                applyDamage(token, { damage, attackType, resistDmg, armorPiercing });
            });

            const formData = new FormDataExtended(html[0].querySelector('form')).object;
            ui.activeWindow.close();
            return formData;
        } else {
            ui.notifications.warn("Damage must be a positive number.");
            return "Damage must be a number.";
        }
        return null;
    }

    async function applyDamage(token, { damage, attackType, resistDmg, armorPiercing }) {
        let name = token.name;
        let exposed = token.actor.statuses.has("exposed");
        let shredded = token.actor.statuses.has("shredded");
        let armor = token.actor.system.armor;
        let hp = token.actor.system.hp.value;
        let heat = token.actor.system.heat.value;
        let burn = token.actor.system.burn;
        let overshield = token.actor.system.overshield.value;
        let tokenURL = token.actor.img;
        let overshieldRemain = 0;
        let effects = "";
        let dmgType = "";
        let newVal = 0;
        let remain = "HP";
        switch (attackType) {
            case 'Weapon':
                dmgType = "Damage";
                break;
            case 'Burn':
                dmgType = "Burn";
                break;
            case 'Heat':
                dmgType = "Heat";
                remain = "Heat"
                break;
        }
        let burnDamage =  attackType === "Burn" ? damage : 0;
        // order matters, of course- lancer is Exposed -> armor -> resistance.
        //if exposed, double damage if normal damage type
        if (exposed && dmgType === "Damage") {
            damage =  damage * 2 ;
            effects +=  `[Exposed (x2)] `;
        }
        //if not armorpiercing, factor in armor for normal damage types unless shredded
        if (!armorPiercing && !shredded && dmgType === "Damage") {
            damage = Math.max(damage - armor, 0); //subtract armor
            effects = effects + `[Armor: ${armor}] `;
        }
        //if resistance, halve damage, rounding up.
        damage = resistDmg && !shredded ? Math.ceil(damage / 2) : damage;
        // Heat doesn't impact OS
        if (dmgType !== "Heat" && overshield > 0) {
            overshieldRemain = overshield - damage >= 0 ? overshield - damage : 0;
            token.actor.update({ "system.overshield": overshieldRemain });
            effects += `[Overshield: ${overshield} -> ${overshieldRemain}] `;
            damage = damage - overshield > 0 ? damage - overshield : 0;
        }
        effects += resistDmg && !shredded ? `[Dmg Resist (x½)] ` : '';
        effects += shredded ? `[Shredded] ` : '';
        effects += armorPiercing ? `[Armor Piercing] ` : '';
        if (dmgType === "Heat") {
            effects += heat + damage >= token.actor.system.heat.max / 2 ? `[DANGER ZONE] ` : '';
            newVal = heat + damage;
            token.actor.update({ "system.heat.value": heat + damage });
        } else if (dmgType === "Burn") {
            effects += `[Burn: ${burnDamage}]`
            token.actor.update({ "system.hp.value": hp - damage, "system.burn": burn + burnDamage });
            newVal = hp - damage;
        } else {
            token.actor.update({ "system.hp.value": hp - damage });
            newVal = hp - damage;
        }
        let msgContent = `<div class="card clipped-bot" style="margin: 0px;">
            <div class="card clipped">
                <div class="lancer-mini-header" >// DAMAGE APPLIED //</div>
                    <div class="lancer-hit">
                        <div>
                            <img class="lancer-hit-thumb" src="${tokenURL}" />
                        </div>
                        <div class="lancer-hit-text">${name}</span>
                            <span>${damage} ${dmgType}</span>
                            <span>(New Value: ${newVal} ${remain})</span>
                        </div>
                    </div>
            </div>
            <div class="card clipped">
                <div class="lancer-mini-header">// DAMAGE MODS //</div>
                <span class="effect-text">${effects}</span>
            </div>
        </div>`
        ChatMessage.create({ //comment this part out if you don't want stuff whispered to chat.
            content: msgContent,
            whisper: ChatMessage.getWhisperRecipients("GM")
        });
    }

    async function promptForDamage() {
        return new Promise((resolve) => {
            const dialog = new Dialog({
                title: "Apply Damage to Selected Token",
                content: htmlFormContent,
                buttons: {},
                render: (html) => {
                    html.on('click', 'button[name="dmgType"]', (event) => {
                        let clickResult = handleButtonClick(html, event);
                        if (clickResult === null) {
                            resolve(null);
                        } else if (typeof clickResult === "string") {
                            resolve(null);
                        } else {
                            resolve(clickResult);
                        }
                    });
                },
                close: () => {
                    resolve('User closed dialog without making a selection.');
                },
            });
            dialog.render(true);
        });
    }

    const damage = await promptForDamage();
}

/*
!!This is a modfication of Carcosa's Apply Damage Macro from PILOT.NET Discord, all credit to them!!

Lancer Apply Damage - Automated, Kind Of!

REQUIRES my Apply Damage macro (and requires it to be named 'Apply Damage'), plus Warpgate and Math.js.


This macro adds a little automation to my other macro- mostly it just saves you from having to enter DAMAGE yourself.

Specifically, running this macro does the following:
1. look through the last few (default: 3) chat messages, starting from the most recent, to find a Weapon card.
2. Once found, it digs through the weapon card and extracts the rolled damage values.
3. Passes said damage value to the Apply Damage macro, automatically filling out the default value as appropriate.

You still have to check for resistance and click the damage type.

TO-DO: pass damage type to the macro too. It won't actually save any steps, because damage type buttons double as confirmation, but I think it'd look nice.


CHANGELOG

v1.1: Compatiability for FoundryV11; thanks to Zenn. 
v1.2: now passes damage type to the apply damage macro; assuming you are using the most recent apply-damage macro, it should now color the correct damage type when passed to the apply-damage macro. useful for weapons that have multiple damage types.
Please use alongside applydamage_base_v3_4 or higher.
v1.3: updated to be compatible with damage macro v4.
*/
export async function autoApplyDamage(){
    let damageArray = [];
    for (let i = -1; i >= -3; i--) {
        let message = [...game.messages].at(i);
        if (message?.flags.lancer?.attackData) {
            // i.e "this is a WEAPON card". Conveniently, invade cards don't have this flag.
            let content = message.content;
            let contentArray = content.split('\n');

            // Filter lines to find damage information
            contentArray = contentArray.filter((line) => line.includes("lancer-dice-total major"))
            contentArray = contentArray.filter((line) => line.includes("damage"))
            
            damageArray = contentArray.map(line => {
                let numMatch = line.match(/\d+/);
                let type = checkDamage(line);
                return {
                    dmg: parseInt(numMatch ? numMatch[0] : 0),
                    type: type || "unknown"
                };
            });
            const numreg = /\d+/;

            if(game.settings.get('lancer-mini-automations', 'enableSkipSelfHeat') && content.includes("// SELF HEAT //")){
                // Skip the last damage number, as that is the self heat
                damageArray.pop();
            }
            
            // Check if damage values were found
            if (damageArray.length > 0) {
                let attackingToken = game.actors.get(message.flags.lancer.attackData.origin);
                if (attackingToken) {
                    ui.notifications.info(`Extracted damage values from ${attackingToken.name}'s last attack.`);
                }
                
                // Execute Apply Damage with extracted values
                // Reverse the array so that it displays damage in order
                damageArray.reverse();
                // Keep track of how many windows will open
                let i = damageArray.length;
                damageArray.forEach(({ dmg, type }) => {
                    applyDamage(dmg, type, i, damageArray.length);
                    i--;
                });
                return;
            }
        }
    }
    // If we get here, we found no chat messages
    // Just run the macro raw
    applyDamage();
}

// Function to determine damage type
function checkDamage(line) {
    const damageTypes = ["energy", "explosive", "kinetic", "heat", "burn"];
    return damageTypes.find(type => line.includes(type)) || "unknown";
}