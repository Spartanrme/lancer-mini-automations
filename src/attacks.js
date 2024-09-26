export async function changeWeaponProfile(state){
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