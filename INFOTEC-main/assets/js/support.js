(() => {
    const form = document.getElementById("supportForm");
    if (!form) return;

    const message = document.getElementById("message");
    const characterCount = document.getElementById("characterCount");
    const attachment = document.getElementById("attachment");
    const fileName = document.getElementById("fileName");
    const formStatus = document.getElementById("formStatus");
    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    const requestsKey = "stockflowSupportRequests";

    const updateCharacterCount = () => {
        characterCount.textContent = `${message.value.length}/1000`;
    };

    const clearStatus = () => {
        formStatus.className = "form-status";
        formStatus.textContent = "";
    };

    message.addEventListener("input", updateCharacterCount);

    attachment.addEventListener("change", () => {
        clearStatus();
        const file = attachment.files[0];

        if (!file) {
            fileName.textContent = "";
            return;
        }

        if (file.size > 10 * 1024 * 1024 || !allowedTypes.includes(file.type)) {
            attachment.value = "";
            fileName.textContent = "";
            formStatus.className = "form-status error";
            formStatus.textContent = "Escolha um arquivo JPG, PNG, PDF ou DOCX de até 10 MB.";
            return;
        }

        fileName.textContent = `Arquivo selecionado: ${file.name}`;
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        clearStatus();

        if (!form.reportValidity()) return;

        const data = Object.fromEntries(new FormData(form).entries());
        const requests = JSON.parse(localStorage.getItem(requestsKey) || "[]");

        requests.push({
            ...data,
            createdAt: new Date().toISOString(),
            attachment: attachment.files[0]?.name || null
        });

        localStorage.setItem(requestsKey, JSON.stringify(requests));
        form.reset();
        updateCharacterCount();
        fileName.textContent = "";
        formStatus.className = "form-status success";
        formStatus.textContent = `Solicitação enviada, ${data.name}. O protocolo foi salvo neste navegador.`;
    });

    form.addEventListener("reset", () => {
        window.setTimeout(() => {
            updateCharacterCount();
            fileName.textContent = "";
            clearStatus();
        }, 0);
    });

    document.getElementById("notificationButton")?.addEventListener("click", () => {
        const count = JSON.parse(localStorage.getItem(requestsKey) || "[]").length;
        formStatus.className = "form-status success";
        formStatus.textContent = count
            ? `Você tem ${count} solicitação(ões) registrada(s) neste navegador.`
            : "Nenhuma solicitação registrada neste navegador.";
        formStatus.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    updateCharacterCount();
})();
