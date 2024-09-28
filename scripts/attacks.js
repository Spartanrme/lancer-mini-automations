/* 
Some tech attack automation
Most tech attack "invades" have invade === yes
Basic tech attack & quick techs do not - so we need to check by name for what to do
*/
export async function invadeEffectsAutomation(state, socket) {
  if(game.settings.get('lancer-mini-automations', 'enableInvadeEffectsAutomation') === false) return false;

  // Setup for chat messages
  let statusApplied = false;
  let tokenURL = ``;
  let heat;
  let tempdamage = 0;
  let dmgType = ``;

  // Run it for each target hit
  if(state.state.data.hit_results.length >= 1){
      let hitResult = state.state.data.hit_results[0];
      // Invade-Tagged System flow
      if(hitResult.hit && state.state.data.invade){
          let token = state.state.data.attack_rolls.targeted[0].target;
          let actor = token.actor;
          let id = token.document._id;
          // Set values for chat message
          statusApplied = true;
          tokenURL = actor.img;
          dmgType = `HEAT`
          // On each hit, increase heat by two
          heat = actor.system.heat.value;
          tempdamage = 2;
          // Update Token
          let updateValues = ["system.heat.value", (heat + tempdamage)];
          await socket.executeAsGM("updateToken", id, updateValues);
          tempdamage = actor.system.heat.value - heat;
      }
      // Basic Tech Attack flow
      else if(hitResult.hit && state.state.data.title.includes("TECH ATTACK")){
        let token = state.state.data.attack_rolls.targeted[0].target;
        let actor = token.actor;
        let id = token.document._id;
        let result = await Dialog.confirm({
            title: "Basic Tech Attack",
            content: "Apply Fragment Signal to target?",
            yes: () => { return true;},
            no: () => {return false;},
            defaultYes: false
        });
        if(result){
            // Set values for chat message
            statusApplied = true;
            tokenURL = actor.img;
            dmgType = `HEAT`;
            // On each hit, increase heat by two
            heat = actor.system.heat.value;
            tempdamage = 2;
            // Update Token
            let updateValues = ["system.heat.value", (heat + tempdamage)];
            await socket.executeAsGM("updateToken", id, updateValues);
            tempdamage = actor.system.heat.value - heat;
            // Don't apply impaired to PCs with Design Core Bonus
            if(actor.type != "mech" || (actor.system?.pilot?.value.items.some((i) => i.system.lid === "cb_superior_by_design") != true)){
                dmgType += `, Impaired`;
                await socket.executeAsGM("updateTokenCondition", id, "impaired", false);
            }
            // Don't apply slow to PCs
            if(actor.type != "mech"){
                dmgType += `, Slowed`;
                await socket.executeAsGM("updateTokenCondition", id, "slow", false);
            } 
        }
      }
  }
  if(statusApplied){
        let msgContent = `<div class="card clipped-bot" style="margin: 0px;">
            <div class="card clipped">
                <div class="lancer-mini-header" >// DAMAGE APPLIED //</div>
                    <div class="lancer-hit">
                        <div>
                            <img class="lancer-hit-thumb" src="${tokenURL}" />
                        </div>
                        <div>
                            <span style='word-break: break-all; word-wrap: break-word;'>has taken ${tempdamage} ${dmgType}</div>
                        </div>
                    </div>
            </div>
        </div>`

        ChatMessage.create({ //comment this part out if you don't want stuff whispered to chat.
        content: msgContent,
        whisper: ChatMessage.getWhisperRecipients("GM")
        });
  }
  return;
}

export async function changeWeaponProfile(state){
    if(game.settings.get('lancer-mini-automations', 'enableProfileAutomation') === false) 
        return true;

    let item = state.item;
        
    if(item.system["profiles"].length <= 1){
        return true;
    }

    let profiles = ``;
    let currentProfile = item.system.selected_profile_index;
    for(let i = 0; i <item.system["profiles"].length; i++){
    if(i === currentProfile)
        profiles += `<option selected="selected" value=${i}>${item.system["profiles"][i].name}</option>`;
    else
        profiles += `<option value=${i}>${item.system["profiles"][i].name}</option>`;
    }

    await Dialog.prompt({
        title: 'Select a Weapon Profile',
        content: `
            <div class="form-group">
            <label for="weaponProfile"</label>
            <select name="weaponProfile">
                ${profiles}
            </select>
            </div>
        `,
            callback: async(html) => {
            let select = parseInt(html.find('[name="weaponProfile"]').val());
            if(typeof select != 'number') 
                return false;
            await item.update({
            "system.selected_profile_index":select,
            });
            return true;
        }
    });
    return true;
}