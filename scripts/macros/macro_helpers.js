// This macro returns the actor that a player is speaking as (what they have selected) if they have permissions to it, or themselves if they have nothing selected. This macro is meant to be run within the ChatMessage method:
/*
EXAMPLE:
ChatMessage.create({
    speaker: ChatMessage.getSpeaker({
    actor: game.macros.getName("Get-Speaker").execute()
}),
*/
async function getSpeaker(){
    try{
        let ownerObject = await canvas.tokens.controlled[0].actor.ownership
            //console.log(ownerObject)
            let ownerIDCode = ""
            for (let [key, value] of Object.entries(ownerObject)) {
                if (key == "default") {
                    console.log("Default. Ignoring...")
                } else if (game.users.filter(u => u.isGM).map(u => u.id).includes(key)) { 
                    console.log("GM user. Ignoring...")
                } else {
                    if (value == 3) {
                        console.log(`${key} is the ID of the owner.`)
                        ownerIDCode = key
                    }
                }
            }
        
        let ownerUser = game.users.get(ownerIDCode)	
        let myActor = ownerUser.character || game.user.character || canvas.tokens.controlled[0].actor;
        return myActor;
    }
    catch{
        return null;
    }
}
