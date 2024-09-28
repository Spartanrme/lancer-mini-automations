import { updateToken, updateTokenCondition, updateTokenOwnership } from "./updater.js";
import { changeWeaponProfile, invadeEffectsAutomation } from "./attacks.js";
import { registerSettings } from "./settings.js";
import { resistHeat } from "./reductions.js";
import { roundStartRoll } from "./combats.js";
import { runLoadoutDie } from "./macros/loadout_die.js";

let socket; // pass this to functions that require users to request GM to update tokens

Hooks.once("socketlib.ready", () => {
	socket = socketlib.registerModule("lancer-mini-automations");
	socket.register("updateToken", updateToken);
	socket.register("updateTokenOwnership", updateTokenOwnership);
  socket.register("updateTokenCondition", updateTokenCondition);
});

Hooks.once("lancer.registerFlows", (flowSteps, flows) => {
  flowSteps.set("changeWeaponProfile", changeWeaponProfile);

    const weaponAttackFlow = flows.get("WeaponAttackFlow");
    if (weaponAttackFlow) {
      weaponAttackFlow.insertStepBefore("initAttackData", "changeWeaponProfile");
    }
  }
);

Hooks.on('init', registerSettings);

Hooks.on('init', function () { console.log('lancer-mini-automations | Init'); });

Hooks.on('ready', function () {
  console.log('lancer-mini-automations | exposing macro names.');
  game.modules.get('lancer-mini-automations').exposed = {
      runLoadoutDie
  };
});

Hooks.on("lancer.postFlow.TechAttackFlow", async (state) => invadeEffectsAutomation(state, socket));

Hooks.on("preUpdateActor", resistHeat);

Hooks.on("updateCombat", roundStartRoll);
