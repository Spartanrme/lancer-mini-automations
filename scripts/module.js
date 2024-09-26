import { changeWeaponProfile } from "./attacks";

Hooks.once("lancer.registerFlows", (flowSteps, flows) => {
  flowSteps.set("changeWeaponProfile", changeWeaponProfile);

    const weaponAttackFlow = flows.get("WeaponAttackFlow");
    if (weaponAttackFlow) {
      weaponAttackFlow.insertStepBefore("initAttackData", "changeWeaponProfile");
    }
  }
);