// Logic for table rendering

export function renderTable(fragments, tbody, section){
    console.log("Inside RenderTable", fragments)
    tbody.innerHTML= "";
    console.log("Fragments length: ", fragments.fragments.length)
    if(!fragments.fragments.length){
        console.log("is this being hit")
        section.hidden = true;
        return; 
    }
    fragments.fragments.forEach((f)=>{
        const tr = document.createElement("tr");
        console.log(f)
        tr.innerHTML = `
        <td>${f.id}</td>
        <td>${f.type}</td>
        <td>${f.size}</td>
        <td>${new Date(f.created).toLocaleString()}</td>
        <td>${new Date(f.updated).toLocaleString()}</td>
        <td><button class="viewBtn"  data=id="${f.id}"> View</button></td>
        `;
        tbody.appendChild(tr);

    });
    section.hidden = false;
}