import { getUserFragments } from "../api"; 
import { renderTable } from "./renderTable";

export async function loadFragments(user, ui){
    try{
        const data = await getUserFragments(user, true);
        const fragments = data?.fullMetadata || [];
        renderTable(user, data, ui.fragmentsTableBody, ui.fragmentsSection);
        
    }
    catch(err){
        ui.fragmentsSection.hidden=true;
    }
}