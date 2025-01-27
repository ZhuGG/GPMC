document.addEventListener("DOMContentLoaded", function () {
    const commandInput = document.getElementById("commandInput");
    const quantityInput = document.getElementById("quantityInput");
    const sizeInput = document.getElementById("sizeInput");
    const finishInput = document.getElementById("finishInput");
    const typeInput = document.getElementById("typeInput");
    const cartonInput = document.getElementById("cartonInput");
    const commandList = document.getElementById("commandList");

    let commands = JSON.parse(localStorage.getItem("commands")) || [];
    // Récupération des stats stockées
let stats = JSON.parse(localStorage.getItem("stats")) || {
    badgesToday: 0,
    badgesWeek: 0,
    badgesMonth: 0,
    lastUpdate: new Date().toISOString().split('T')[0]  // Stocke la dernière mise à jour
};

function updateStats() {
    let today = new Date().toISOString().split('T')[0]; // Date du jour
    let currentWeek = getWeekNumber(new Date());  // Numéro de la semaine actuelle
    let currentMonth = new Date().getMonth(); // Mois actuel

    let badgesToday = 0, badgesWeek = 0, badgesMonth = 0;

    commands.forEach(command => {
        if (!command.completed) return;  // On ne compte que les commandes terminées

       if (!command.dateAdded || isNaN(new Date(command.dateAdded).getTime())) {
    console.warn("Commande avec date invalide ignorée :", command);
    return;  // Ignore cette commande si la date est invalide
}
let commandDate = new Date(command.dateAdded).toISOString().split('T')[0];

        let commandWeek = getWeekNumber(new Date(command.dateAdded));
        let commandMonth = new Date(command.dateAdded).getMonth();

        if (commandDate === today) {
            badgesToday += parseInt(command.quantity);
        }
        if (commandWeek === currentWeek) {
            badgesWeek += parseInt(command.quantity);
        }
        if (commandMonth === currentMonth) {
            badgesMonth += parseInt(command.quantity);
        }
    });

    stats.badgesToday = badgesToday;
    stats.badgesWeek = badgesWeek;
    stats.badgesMonth = badgesMonth;
    stats.lastUpdate = today;

    localStorage.setItem("stats", JSON.stringify(stats));

    document.getElementById("badgesToday").textContent = badgesToday;
    document.getElementById("badgesWeek").textContent = badgesWeek;
    document.getElementById("badgesMonth").textContent = badgesMonth;
}


// Fonction pour récupérer le numéro de la semaine
function getWeekNumber(d) {
    let date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    let dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    let yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
}

// Appel de la mise à jour des stats au démarrage
updateStats();


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

        if (commandData.name === "" || commandData.quantity === "") return;

        commands.push(commandData);
        saveCommands();
        //updateStats();
     

        renderCommands();
        commandInput.value = "";
        quantityInput.value = "";
        commandInput.focus();
    }

    function completeCommand(index) {
        commands[index].completed = !commands[index].completed;
        commands[index].paused = false;  // Annule la pause si terminé
        saveCommands();
        console.log("Mise à jour des stats exécutée !");
//updateStats();
       

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
        //updateStats();
        

        renderCommands();
    }

    function saveCommands() {
        localStorage.setItem("commands", JSON.stringify(commands));
    }

function exportToCSV() {
    if (commands.length === 0) {
        alert("Aucune commande à exporter.");
        return;
    }

    let csvContent = "Nom,Quantité,Taille,Finition,Type,Carton,Date ajoutée,Statut\n";
    commands.forEach(command => {
        csvContent += `"${command.name}","${command.quantity}","${command.size}","${command.finish}","${command.type}","${command.carton}","${command.dateAdded}","${command.completed ? "Terminé" : command.paused ? "En pause" : "En cours"}"\n`;
    });

    let blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "commandes_badges.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

window.exportToCSV = exportToCSV;


    window.addCommand = addCommand;
    window.completeCommand = completeCommand;
    window.togglePause = togglePause;
    window.deleteCommand = deleteCommand;
    window.renderCommands = renderCommands;
    window.exportToCSV = exportToCSV;

    renderCommands();
});

window.exportToCSV = exportToCSV;

