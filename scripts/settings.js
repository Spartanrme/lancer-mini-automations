//#region classes
class roundStartRollFormApplication extends FormApplication {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = 'lancer-mini-automations-roundStartRollMenu';
        options.template = 'modules/lancer-mini-automations/templates/combatStartTemplate.hbs';
        options.height = 'auto';
        options.width = 550;
        options.title = 'Round Start Roll Automation';
        return options;
    }

    getData(options = {}) {
        let context = super.getData();
        context.roundStartEnable = game.settings.get('lancer-mini-automations', 'roundStartEnable');
        context.roundStartRollName = game.settings.get('lancer-mini-automations', 'roundStartRollName');
        context.roundStartDieSize = game.settings.get('lancer-mini-automations', 'roundStartDieSize');
        context.roundStartSuccessRange = game.settings.get('lancer-mini-automations', 'roundStartSuccessRange');
        return context;
    }

    _updateObject(event, formData) {
        game.settings.set('lancer-mini-automations', 'roundStartEnable', formData.roundStartEnable);
        game.settings.set('lancer-mini-automations', 'roundStartRollName', formData.roundStartRollName);
        game.settings.set('lancer-mini-automations', 'roundStartDieSize', formData.roundStartDieSize);
        game.settings.set('lancer-mini-automations', 'roundStartSuccessRange', formData.roundStartSuccessRange);
    }
}

class invadeAutomationsFormApplication extends FormApplication {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = 'lancer-mini-automations-invadeAutomationsMenu';
        options.template = 'modules/lancer-mini-automations/templates/invadeAutomationsTemplate.hbs';
        options.height = 'auto';
        options.width = 550;
        options.title = 'Invade Automations';
        return options;
    }

    getData(options = {}) {
        let context = super.getData();
        context.enableInvadeAutomations = game.settings.get('lancer-mini-automations', 'enableInvadeAutomations');
        context.enableInvadeWhispers = game.settings.get('lancer-mini-automations', 'enableInvadeWhispers');
        context.enableDuatAutomation = game.settings.get('lancer-mini-automations', 'enableDuatAutomation');
        return context;
    }

    _updateObject(event, formData) {
        game.settings.set('lancer-mini-automations', 'enableInvadeAutomations', formData.enableInvadeAutomations);
        game.settings.set('lancer-mini-automations', 'enableInvadeWhispers', formData.enableInvadeWhispers);
        game.settings.set('lancer-mini-automations', 'enableDuatAutomation', formData.enableDuatAutomation);
    }
}

class applyDamageFormApplication extends FormApplication {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = 'lancer-mini-automations-applyDamageMenu';
        options.template = 'modules/lancer-mini-automations/templates/applyDamageTemplate.hbs';
        options.height = 'auto';
        options.width = 550;
        options.title = 'Apply Damage Menu';
        return options;
    }

    getData(options = {}) {
        let context = super.getData();
        context.whisperType = game.settings.get('lancer-mini-automations', 'whisperType');
        context.enableApplyDamageSkipSelfHeat = game.settings.get('lancer-mini-automations', 'enableApplyDamageSkipSelfHeat');
        context.enableApplyDamageShowReactions = game.settings.get('lancer-mini-automations', 'enableApplyDamageShowReactions');
        return context;
    }

    _updateObject(event, formData) {
        game.settings.set('lancer-mini-automations', 'whisperType', formData.whisperType);
        game.settings.set('lancer-mini-automations', 'enableApplyDamageSkipSelfHeat', formData.enableApplyDamageSkipSelfHeat);
        game.settings.set('lancer-mini-automations', 'enableApplyDamageShowReactions', formData.enableApplyDamageShowReactions);
    }
}
//#endregion

export function registerSettings() {
    //#region roundStartRollMenu
    game.settings.registerMenu("lancer-mini-automations", "roundStartRollMenu", {
        name: "Round Start Roll Menu",
        label: "Round Start Roll Settings",      // The text label used in the button
        hint: "Modify name and size of a die to roll everytime a round in combat starts.",
        icon: "fas fa-bars",               // A Font Awesome icon used in the submenu button
        type: roundStartRollFormApplication,   // A FormApplication subclass
        restricted: true                   // Restrict this submenu to gamemaster only?
    });

    game.settings.register('lancer-mini-automations', 'roundStartEnable', {
        name: 'Enable Round Start Automation',
        hint: 'Automates rolling a die of a specified size at each round start during combat.',
        scope: 'world',
        config: false,
        type: Boolean,
        default: false
    });

    game.settings.register('lancer-mini-automations', 'roundStartRollName', {
        name: 'Roll Name',
        hint: 'The name that will appear in the chat message for the roll.',
        scope: 'world',
        config: false,
        type: String,
        default: 'Round Start Roll',
    });

    game.settings.register('lancer-mini-automations', 'roundStartDieSize', {
        name: 'Die Size',
        hint: 'The size of the die to roll.',
        scope: 'world',
        config: false,
        type: Number,
        default: 6,
    });

    game.settings.register('lancer-mini-automations', 'roundStartSuccessRange', {
        name: 'Success Range',
        hint: '(WIP) The target number to consider the roll a success.',
        scope: 'world',
        config: false,
        type: Number,
        range:{
            min:1,
            step:1,
            max:20
        },
    });
    //#endregion
    
    //#region invadeAutomationMenu
    game.settings.registerMenu('lancer-mini-automations', 'invadeAutomationsMenu', {
        name: 'Invade Automations Menu',
        label: "Invade Automations Settings",
        hint: "Turn on or off status/heat automations for invades.",
        icon: "fas fa-bars",
        type: invadeAutomationsFormApplication,
        restricted: true
    });

    game.settings.register('lancer-mini-automations', 'enableInvadeAutomations', {
        name: 'Enable Invade Automations',
        hint: '',
        scope: 'world',
        config: false,
        type: Boolean,
        default: true
    });

    game.settings.register('lancer-mini-automations', 'enableInvadeWhispers', {
        name: 'Enable Invade Whispers',
        hint: '',
        scope: 'world',
        config: false,
        type: Boolean,
        default: true
    });

    game.settings.register('lancer-mini-automations', 'enableDuatAutomation', {
        name: 'Enable Duat Automation',
        hint: '',
        scope: 'world',
        config: false,
        type: Boolean,
        default: true
    });
    //#endregion

    //#region applyDamageMenu
    game.settings.registerMenu('lancer-mini-automations', 'applyDamageMenu', {
        name: 'Apply Damage Menu',
        label: "Apply Damage Settings",
        hint: "Change settings related to the Apply Damage macro.",
        icon: "fas fa-bars",
        type: applyDamageFormApplication,
        restricted: true
    });

    game.settings.register('lancer-mini-automations', 'whisperType', {
        name: 'Apply Damage Macro: Enable Damage Whispers',
        scope: 'world',
        config: false,
        type: String,
        choices: {
            "all": "Whisper on both PC and NPC",
            "npc": "Whisper on only NPC",
            "pc": "Whisper on only PC",
            "none": "Disable whispers"
        },
        default: true
    });

    game.settings.register('lancer-mini-automations', 'enableApplyDamageSkipSelfHeat', {
        name: 'Apply Damage Macro: Skip Self Heat',
        scope: 'world',
        config: false,
        type: Boolean,
        default: true,
        onChange: value => { console.log(value) }
    });

    game.settings.register('lancer-mini-automations', 'enableApplyDamageShowReactions', {
        name: 'Apply Damage Macro: Show Damage Reactions/Reductions',
        scope: 'world',
        config: false,
        type: Boolean,
        default: true,
        onChange: value => { console.log(value) }
    });
    //#endregion

    game.settings.register('lancer-mini-automations', 'enableResistHeatAutomation', {
        name: 'Enable Resist Heat Automation',
        hint: 'If a token has the status with an id named "resist_heat", halves the heat updated to the token.',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
        onChange: value => { console.log(value) }
    });

    game.settings.register('lancer-mini-automations', 'enableNPCTraitReminders', {
        name: 'Enable Resist Heat Automation',
        hint: 'If enabled, gives a UI notification for the GM during active combat of NPC traits related to attacking when attacking with a weapon.',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
        onChange: value => { console.log(value) }
    });

    game.settings.register('lancer-mini-automations', 'enableProfileAutomation', {
        name: 'Enable Weapon Profile Automation',
        hint: 'If a user rolls an attack with a weapon, enables a dropdown that allows the user to switch which profile to attack with.',
        scope: 'user',
        config: true,
        type: Boolean,
        default: true,
        onChange: value => { console.log(value) }
    });
}