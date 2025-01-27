document.addEventListener("DOMContentLoaded", function () {
    const commandInput = document.getElementById("commandInput");
    const quantityInput = document.getElementById("quantityInput");
    const sizeInput = document.getElementById("sizeInput");
    const finishInput = document.getElementById("finishInput");
    const typeInput = document.getElementById("typeInput");
    const cartonInput = document.getElementById("cartonInput");
    const commandList = document.getElementById("commandList");

    let commands = JSON.parse(localStorage.getItem("commands")) || [];

    function renderCommands(filter = "all") {
        commandList.innerHTML = "";

        let filteredCommands = commands.filter(command => 
            filter === "all" || 
            (filter === "active" && !command.completed && !command.paused) || 
            (filter === "paused" && command.paused) ||
            (filter === "completed" && command.completed)
        );

        filteredCommands.forEach((command, index) => {
            let commandDiv = document.createElement("div");
            commandDiv.className = "command";
            if (command.paused) commandDiv.classList.add("paused");
            if (command.completed) commandDiv.classList.add("completed");

            commandDiv.innerHTML = `
                <span>${command.name} - ${command.quantity} badges (${command.size})</span>
                <br><small>Finition : ${command.finish} | Type : ${command.type} | Carton : ${command.carton}</small>
                <br><small>Ajouté : ${command.dateAdded}</small>
                <br><small>Statut : ${command.completed ? "Terminé" : command.paused ? "En pause" : "En cours"}</small>
                <div class="btn-container">
                    <button onclick="completeCommand(${index})">${command.completed ? "Annuler" : "Fait"}</button>
                    <button onclick="togglePause(${index})">${command.paused ? "Reprendre" : "Pause"}</button>
                    <button onclick="deleteCommand(${index})">Supprimer</button>
                </div>
            `;
            commandList.appendChild(commandDiv);
        });
    }

    function addCommand() {
        let commandData = {
            name: commandInput.value.trim(),
            quantity: quantityInput.value.trim(),
            size: sizeInput.value,
            finish: finishInput.value,
            type: typeInput.value,
            carton: cartonInput.value,
            dateAdded: new Date().toLocaleString(),
            completed: false,
            paused: false
        };

        if (commandData.name === "" || commandData.quantity === "") return;

        commands.push(commandData);
        saveCommands();
        renderCommands();
        commandInput.value = "";
        quantityInput.value = "";
        commandInput.focus();
    }

    function completeCommand(index) {
        commands[index].completed = !commands[index].completed;
        commands[index].paused = false;  // Annule la pause si terminé
        saveCommands();
        renderCommands();
    }

    function togglePause(index) {
        commands[index].paused = !commands[index].paused;
        commands[index].completed = false;  // Annule "Terminé" si mis en pause
        saveCommands();
        renderCommands();
    }

    function deleteCommand(index) {
        commands.splice(index, 1);
        saveCommands();
        renderCommands();
    }

    function saveCommands() {
        localStorage.setItem("commands", JSON.stringify(commands));
    }

    function exportToCSV() {
        let csvContent = "Nom,Quantité,Taille,Finition,Type,Carton,Date ajoutée,Statut\n";
        commands.forEach(command => {
            csvContent += `${command.name},${command.quantity},${command.size},${command.finish},${command.type},${command.carton},${command.dateAdded},${command.completed ? "Terminé" : command.paused ? "En pause" : "En cours"}\n`;
        });

        let blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        let link = document.createElement("a");
        link.setAttribute("href", URL.createObjectURL(blob));
        link.setAttribute("download", "commandes_badges.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    window.addCommand = addCommand;
    window.completeCommand = completeCommand;
    window.togglePause = togglePause;
    window.deleteCommand = deleteCommand;
    window.renderCommands = renderCommands;
    window.exportToCSV = exportToCSV;

    renderCommands();
});
