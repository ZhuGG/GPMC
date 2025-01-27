document.addEventListener("DOMContentLoaded", function () {
    console.log("Chargement de script.js OK");

    // Récupération des éléments du DOM
    const commandInput   = document.getElementById("commandInput");
    const quantityInput  = document.getElementById("quantityInput");
    const sizeInput      = document.getElementById("sizeInput");
    const finishInput    = document.getElementById("finishInput");
    const typeInput      = document.getElementById("typeInput");
    const cartonInput    = document.getElementById("cartonInput");
    const commandList    = document.getElementById("commandList");

    // Récupération des données (localStorage)
    let commands = JSON.parse(localStorage.getItem("commands")) || [];

    // --- Fonctions de gestion des commandes ---
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
            dateAdded: new Date().toISOString(),
            completed: false,
            paused: false
        };

        if (commandData.name === "" || commandData.quantity === "") {
            return;
        }

        commands.push(commandData);
        saveCommands();
        renderCommands();
        
        // Réinitialise les champs
        commandInput.value = "";
        quantityInput.value = "";
        commandInput.focus();
    }

    function completeCommand(index) {
        commands[index].completed = !commands[index].completed;
        commands[index].paused    = false;  // Si on complète, on annule la pause
        saveCommands();
        renderCommands();
    }

    function togglePause(index) {
        commands[index].paused    = !commands[index].paused;
        commands[index].completed = false;  // Si on pause, on annule "Terminé"
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

    // --- Fonction d'export CSV ---
    function exportCSV() {
        if (commands.length === 0) {
            alert("Aucune commande à exporter.");
            return;
        }

        // En-tête CSV
        let csvContent = "Nom,Quantité,Taille,Finition,Type,Carton,Date ajoutée,Statut\n";

        // Contenu CSV
        commands.forEach(command => {
            let statut = command.completed ? "Terminé" : (command.paused ? "En pause" : "En cours");
            csvContent += `"${command.name}",`
                        + `"${command.quantity}",`
                        + `"${command.size}",`
                        + `"${command.finish}",`
                        + `"${command.type}",`
                        + `"${command.carton}",`
                        + `"${command.dateAdded}",`
                        + `"${statut}"\n`;
        });

        // Création du fichier CSV
        let blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        let link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "commandes_badges.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // --- Rendre les fonctions accessibles depuis HTML (ou d'autres scripts) ---
    window.addCommand       = addCommand;
    window.completeCommand  = completeCommand;
    window.togglePause      = togglePause;
    window.deleteCommand    = deleteCommand;
    window.renderCommands   = renderCommands;
    window.exportCSV        = exportCSV;

    // Au chargement, on rend la liste
    renderCommands();
    console.log("Toutes les fonctions sont prêtes !");
});
