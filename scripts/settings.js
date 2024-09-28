export function registerSettings() {
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