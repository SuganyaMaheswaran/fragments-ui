// Extract form toggling logic

import { SUPPORTED_CONTENT_TYPES } from "../constants";

export function toggeForm(ui){
    const {fragmentForm, fragmentsSection, typeSelect } = ui
    if(fragmentForm.hidden){
        fragmentForm.hidden = false; 
        fragmentsSection.hidden = true;
    }
    else {
        fragmentForm.hidden = true; 
        fragmentsSection  = false;
        
    }
    // Populate types
    typeSelect.innerHTML = "";
    SUPPORTED_CONTENT_TYPES.forEach((type)=>{
        const option = document.createElement("option");
        option.value = type;
        option.textContent = type;
        typeSelect.appendChild(option);
    });
}