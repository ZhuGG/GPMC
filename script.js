document.addEventListener("DOMContentLoaded", function () {
    const commandInput = document.getElementById("commandName");
    const commandList = document.getElementById("commandList");

    // Charger les commandes sauvegardées
    let commands = JSON.parse(localStorage.getItem("commands")) || [];

    function renderCommands() {
        commandList.innerHTML = "";
        commands.forEach((command, index) => {
            let li = document.createElement("li");
            li.textContent = command;
            
            let deleteBtn = document.createElement("button");
            deleteBtn.textContent = "❌";
            deleteBtn.style.marginLeft = "10px";
            deleteBtn.onclick = function () {
                commands.splice(index, 1);
                saveAndRender();
            };

            li.appendChild(deleteBtn);
            commandList.appendChild(li);
        });
    }

    function saveAndRender() {
        localStorage.setItem("commands", JSON.stringify(commands));
        renderCommands();
    }

    document.querySelector("button").addEventListener("click", function () {
        let command = commandInput.value.trim();
        if (command !== "") {
            commands.push(command);
            commandInput.value = "";
            saveAndRender();
        }
    });

    renderCommands();
});
