// Logic for table rendering

export function renderTable(fragments, tbody, section){
    tbody.innerHTML= "";
    if(!fragments.fragments.length){
        section.hidden = true;
        return; 
    }
    fragments.fragments.forEach((f)=>{
        const tr = document.createElement("tr");
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