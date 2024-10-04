1.0.0  
Initial Release

1.1.0  
Added resist heat and basic invade effects automation.

1.2.0  
Added combat round start roll automation.

1.2.1  
Fixed the round start logic to prevent all clients from rolling the die.
Updated the wording of the success range field to indicate that it isn't ready for use yet.

1.3.0  
Added compendium pack for items this module uses for statuses. 
Added compendium pack for automation macros:
- Loadout Die Tracker
- Stormbender Die Tracker
- Blademaster Die Tracker
- Iconoclast Die Tracker & Damage Automation
- Hurl Into the Duat Die Tracker, which is automatically ran when the "Hurl Into the Duat" tech attack system is detected.

Numerous bugfixes:
- Fixed incorrect logic for updating statuses
- Fixed Round Start Die Roll rolling for all clients connected.

1.4.0  
Removed helper macros from compendium (moved to module).
Added customized apply damage macro.

Bugfixes:
- Fixed shift key not being detected in npc reactions macro

2.0.0  
New release tag workflow so Foundry can update the module properly.

2.1.0  
Added various additional settings:
- Toggle for auto-applying heat from invades
- Toggle for GM whispers for statuses and heats from invades
- Toggle for Hurl Into the Duat automation
- Toggle for chat whispers from the Apply Damage macro.

2.2.0
Added additional dropdown to disable whispers on the apply damage macro for NPCs/PCs/both.

2.2.1
Fixed npc damage reductions not appearing in damage reduction macro
Added some spacing between the damage input and npc reductions text in the apply damage macro

2.3.0
Re-organized the settings menu for the apply damage macro, including a new setting for turning on/off the NPC reminders.

2.3.1
Fixed a bug that prevented being able to use NPC weapons.

2.3.2
Fixed a bug that prevented npc attacks from going past the HUD.

2.4.0
Added a new feature: UI reminders when preforming an NPC attack that reminds the GM what traits the NPC has that may affect it's attack (in terms of acc, diff, etc...)