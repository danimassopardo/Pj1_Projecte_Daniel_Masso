/**
 * Funció per carregar els contactes des del fitxer JSON.
 * Simula una crida a un servidor.
 * @returns {Promise<Array>} Una promesa que resol amb la llista de contactes.
 */
async function carregarContactesDelServidor() {
    try {
        const resposta = await fetch('contacts.json');
        if (!resposta.ok) {
            throw new Error('No s\'ha pogut carregar contacts.json');
        }
        const contactes = await resposta.json();
        return contactes;
    } catch (error) {
        console.error('Error carregant els contactes:', error);
        return []; // Retorna un array buit en cas d'error
    }
}

/**
 * Funció per obtenir els contactes del LocalStorage.
 * Si no hi ha contactes, els carrega del "servidor" (JSON).
 * @returns {Promise<Array>} Una promesa que resol amb la llista de contactes.
 */
async function obtenirContactes() {
    let contactes = JSON.parse(localStorage.getItem('contactes'));
    if (!contactes) {
        contactes = await carregarContactesDelServidor();
        guardarContactes(contactes);
    }
    return contactes;
}

/**
 * Funció per guardar la llista de contactes al LocalStorage.
 * @param {Array} contactes La llista de contactes a guardar.
 */
function guardarContactes(contactes) {
    localStorage.setItem('contactes', JSON.stringify(contactes));
}

/**
 * Funció per mostrar tots els contactes a la taula de index.html.
 */
async function mostrarContactes() {
    const contactes = await obtenirContactes();
    const tbody = document.querySelector('#contactes-taula tbody');
    tbody.innerHTML = ''; // Neteja la taula abans d'afegir noves files

    contactes.forEach(contacte => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${contacte.nom}</td>
            <td>${contacte.email}</td>
            <td>${contacte.telefon}</td>
            <td>
                <a href="detall.html?id=${contacte.id}">Veure Detall</a> |
                <button onclick="eliminarContacte(${contacte.id})">Eliminar</button>
                <!-- Aquí es podria afegir un enllaç per modificar -->
            </td>
        `;
        tbody.appendChild(fila);
    });
}

/**
 * Funció per mostrar els detalls d'un contacte a detall.html.
 */
async function mostrarDetallContacte() {
    // Obtenir l'ID del contacte de l'URL
    const params = new URLSearchParams(window.location.search);
    const idContacte = parseInt(params.get('id'));

    if (!idContacte) {
        document.getElementById('detall-contacte').innerHTML = '<p>ID de contacte no vàlid.</p>';
        return;
    }

    const contactes = await obtenirContactes();
    const contacte = contactes.find(c => c.id === idContacte);

    const detallDiv = document.getElementById('detall-contacte');
    if (contacte) {
        detallDiv.innerHTML = `
            <p><strong>ID:</strong> ${contacte.id}</p>
            <p><strong>Nom:</strong> ${contacte.nom}</p>
            <p><strong>Email:</strong> ${contacte.email}</p>
            <p><strong>Telèfon:</strong> ${contacte.telefon}</p>
            <!-- Aquí es podria afegir un botó/enllaç per anar a modificar -->
        `;
    } else {
        detallDiv.innerHTML = '<p>No s\'ha trobat el contacte.</p>';
    }
}

/**
 * Funció per afegir un nou contacte.
 */
async function afegirContacte() {
    const nom = document.getElementById('nom').value;
    const email = document.getElementById('email').value;
    const telefon = document.getElementById('telefon').value;

    const contactes = await obtenirContactes();
    
    // Trobar l'ID més alt i sumar-li 1 per al nou contacte
    const nouId = contactes.length > 0 ? Math.max(...contactes.map(c => c.id)) + 1 : 1;

    const nouContacte = {
        id: nouId,
        nom: nom,
        email: email,
        telefon: telefon
    };

    contactes.push(nouContacte);
    guardarContactes(contactes);

    // Redirigir a la pàgina principal
    window.location.href = 'index.html';
}

/**
 * Funció per eliminar un contacte.
 * @param {number} id L'ID del contacte a eliminar.
 */
async function eliminarContacte(id) {
    if (confirm('Estàs segur que vols eliminar aquest contacte?')) {
        let contactes = await obtenirContactes();
        contactes = contactes.filter(c => c.id !== id);
        guardarContactes(contactes);
        
        // Tornar a carregar la llista de contactes a la vista
        mostrarContactes();
    }
}