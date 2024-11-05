import { updateToken, updateTokenCondition, updateTokenOwnership } from "./updater.js";
import { changeWeaponProfile, invadeEffectsAutomation } from "./attacks.js";
import { registerSettings } from "./settings.js";
import { resistHeat } from "./reductions.js";
import { roundStartRoll, npcAttackTraitReminder, haseReminders, ramReminder, saveReminder } from "./combats.js";
// Macro imports
import { runLoadoutDie } from "./macros/loadout_die.js";
import { runStormbendingDie } from "./macros/stormbender_die.js";
import { runIconoclastDie } from "./macros/iconoclast_die.js";
import { runDuatDie } from "./macros/duat_die.js";
import { runBlademasterDie } from "./macros/blademaster_die.js";
import { displayNpcReactions } from "./macros/npc_reactions.js";
import { autoApplyDamage } from "./macros/damage_automation.js";

let socket; // pass this to functions that require users to request GM to update tokens

async function NotifyGm(message){
  if(game.user.isGM)
    ui.notifications.notify(message);
}

Hooks.once("socketlib.ready", () => {
  console.log('lancer-mini-automations | Registering Sockets');
	socket = socketlib.registerModule("lancer-mini-automations");
	socket.register("updateToken", updateToken);
	socket.register("updateTokenOwnership", updateTokenOwnership);
  socket.register("updateTokenCondition", updateTokenCondition);
  socket.register("NotifyGm", NotifyGm);
});

Hooks.once("lancer.registerFlows", (flowSteps, flows) => {
  flowSteps.set("changeWeaponProfile", changeWeaponProfile);
  flowSteps.set("npcAttackTraitReminder", npcAttackTraitReminder)
  flowSteps.set("haseReminders", haseReminders);
  flowSteps.set("ramReminder", ramReminder);

    const weaponAttackFlow = flows.get("WeaponAttackFlow");
    const statRollFlow = flows.get("StatRollFlow");
    const basicAttackRoll = flows.get("BasicAttackFlow");

    if (weaponAttackFlow){
      weaponAttackFlow.insertStepBefore("initAttackData", "changeWeaponProfile");
      weaponAttackFlow.insertStepBefore("showAttackHUD", "npcAttackTraitReminder");
    }

    if(statRollFlow){
      statRollFlow.insertStepBefore("showStatRollHUD", "haseReminders");
    }

    if(basicAttackRoll){
      basicAttackRoll.insertStepBefore("showAttackHUD", "ramReminder");
    }
  }
);

Hooks.on('init', registerSettings);

Hooks.on('init', function () { console.log('lancer-mini-automations | Init'); });

Hooks.on('ready', function () {
  console.log('lancer-mini-automations | exposing socket.');
  game.modules.get('lancer-mini-automations').socket = socket;
  console.log('lancer-mini-automations | exposing macros.');
  game.modules.get('lancer-mini-automations').exposed = {
      runLoadoutDie,
      runStormbendingDie,
      runIconoclastDie,
      runBlademasterDie,
      displayNpcReactions,
      autoApplyDamage
  };
});

Hooks.on("lancer.postFlow.TechAttackFlow", async (state) => invadeEffectsAutomation(state, socket));

Hooks.on("lancer.postFlow.TechAttackFlow", async (state) => runDuatDie(state, socket));

Hooks.on("preUpdateActor", resistHeat);

Hooks.on("updateCombat", roundStartRoll);
