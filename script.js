tasks=[]

function loadTasks() {
    const listElement = document.getElementById("myList");
    listElement.innerHTML = tasks.map((item, index) =>
                    `<li>
                        <span>${item}</span>
                        <button class="delete-btn" onclick="deleteItem(${index})">✕</button>
                    </li>`
    ).join('');
}

loadTasks()


function deleteItem(index) {
    tasks.pop(index)
    loadTasks()
}

function processInput() {
    const input = document.getElementById("userInput");
    const value = input.value;
    const warning = document.getElementById("emptywarning");
    
    if (value === "") {
        document.getElementById("userInput").value=""
        warning.innerText = "Please provide a task";
    } else {
        document.getElementById("userInput").value=""
        warning.innerText = "";
        tasks.push(value)
        loadTasks()
    }
}

