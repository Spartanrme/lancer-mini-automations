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

2.4.1  
NPC Trait Reminders should now be able to find more traits (it was missing traits that started with "When the", etc....

2.4.2  
Adjusted the kinds of traits the npc trait reminder gets.
Fixed typo in Apply Damage macro settings and logic.

2.4.3  
Fixed a bug in the Apply Damage macro that would indicate multiple tokens were selected when none were.
Removed HTML content from npc trait reminders text.

2.4.4  
Added settings option to turn off NPC trait reminders.

2.4.5  
Fixed typo in NPC Trait Reminders setting.
Fixed bug where said setting didn't work.

2.4.6  
Changed the positioning of the NPC damage reactions/reductions to the bottom of the apply damage macro for better formatting.

2.5.0  
Fixed a bug where whisper setting for the apply damage macro wasn't applying.
New Feature: A UI reminder whenever a mech does a HASE roll will display if the mech has any abilities that modify those rolls.
Added a (user-based) setting to turn the above feature on/off.

2.5.1  
Fixed a bug where NPC Systems would not show up if "Show NPC Damage Reactions/Reductions" was enabled for the Apply Damage macro.

2.5.2  
Modified the Apply Damage macro to capture more NPC traits and systems. Also increased the spacing between each feature in the Apply Damage macro dialog.

2.5.3  
After some feedback, updated the wording on some of the language in the setting menu for better clarity.  
Updated the NPC trait reminder to catch more traits, including reactions.  
Updated NPC Reminders macro to capture more triggers.  
Iconoclast Macro: Added a dialog prompt to confirm if the user wants to enter transcendence.  

2.5.4  
Update names of compendium packs so that they don't get cut off.  

2.5.5  
Future cleaned up wording on various status menu items.

2.6.0
Updated the resist heat functionality. Statuses with the id "resist_heat" the module will always apply half heat to. Added a new setting to specify a number to add to any updates to heat.

2.6.1
Updated the logic of heat modifications to better take care of edge cases. Added a UI notification whenever a token's heat update is modified.

2.6.2
Fixed a but that would reduce total heat updates to zero if heat modifications was greater than heat gained.