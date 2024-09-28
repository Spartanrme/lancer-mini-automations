class roundStartRollFormApplication extends FormApplication {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = 'lancer-mini-automations-roundStartRollMenu';
        options.template = 'modules/lancer-mini-automations/templates/combatStartTemplate.hbs'
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

export function registerSettings() {

    game.settings.registerMenu("lancer-mini-automations", "roundStartRollMenu", {
        name: "Round Start Roll Menu",
        label: "Round Start Roll Settings",      // The text label used in the button
        hint: "Modify name and size of a die to roll everytime a round in combat starts.",
        icon: "fas fa-bars",               // A Font Awesome icon used in the submenu button
        type: roundStartRollFormApplication,   // A FormApplication subclass
        restricted: true,                   // Restrict this submenu to gamemaster only?
        requiresReload: true
    });

    game.settings.register('lancer-mini-automations', 'roundStartEnable', {
        name: 'Enable Round Start Automation',
        hint: 'Automates rolling a die of a specified size at each round start during combat.',
        scope: 'world',
        config: false,
        type: Boolean,
        default: false,
        requiresReload: true,
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
        hint: 'The name that will appear in the chat message for the roll.',
        scope: 'world',
        config: false,
        type: Number,
        range:{
            min:1,
            step:1,
            max:20
        },
    });
    
    game.settings.register('lancer-mini-automations', 'enableInvadeEffectsAutomation', {
        name: 'Enable Invade Effects Automation',
        hint: 'If a user uses a basic tech attack, applies the effects of Fragment Signal to the target. Systems with the invade tag apply 2 heat to their target.',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
        onChange: value => { console.log(value) }
    });

    game.settings.register('lancer-mini-automations', 'enableResistHeatAutomation', {
        name: 'Enable Resist Heat Automation',
        hint: 'If a token has the status with an id named "resist_heat", halves the heat updated to the token.',
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