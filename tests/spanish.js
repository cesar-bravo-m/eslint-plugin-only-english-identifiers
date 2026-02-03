/**
 * LeetCode Problem 76: Minimum Window Substring
 * https://leetcode.com/problems/minimum-window-substring/
 * 
 * Given two strings s and t, return the minimum window substring of s
 * such that every character in t (including duplicates) is included in the window.
 * If there is no such substring, return the empty string "".
 * 
 * Difficulty: Hard
 * Time Complexity: O(m + n) where m = s.length, n = t.length
 * Space Complexity: O(m + n)
 */

function ventanaMinimaCadena(cadenaFuente, cadenaObjetivo) {
    if (cadenaFuente.length === 0 || cadenaObjetivo.length === 0) {
        return "";
    }

    // Build frequency map for target string
    const frecuenciaCaracterObjetivo = new Map();
    for (const caracter of cadenaObjetivo) {
        frecuenciaCaracterObjetivo.set(
            caracter,
            (frecuenciaCaracterObjetivo.get(caracter) || 0) + 1
        );
    }

    // Initialize sliding window variables
    let punteroIzquierdo = 0;
    let punteroDerecho = 0;
    let caracteresRequeridos = frecuenciaCaracterObjetivo.size;
    let caracteresFormados = 0;

    // Track character frequencies in current window
    const frecuenciaCaracterVentana = new Map();

    // Store the result: [window length, left, right]
    let resultadoVentanaMinima = [Infinity, 0, 0];

    while (punteroDerecho < cadenaFuente.length) {
        // Expand window by adding character from right
        const caracterActual = cadenaFuente[punteroDerecho];
        frecuenciaCaracterVentana.set(
            caracterActual,
            (frecuenciaCaracterVentana.get(caracterActual) || 0) + 1
        );

        // Check if current character frequency matches target frequency
        if (frecuenciaCaracterObjetivo.has(caracterActual) &&
            frecuenciaCaracterVentana.get(caracterActual) === frecuenciaCaracterObjetivo.get(caracterActual)) {
            caracteresFormados++;
        }

        // Try to contract window from left while it's valid
        while (caracteresFormados === caracteresRequeridos && punteroIzquierdo <= punteroDerecho) {
            const longitudVentanaActual = punteroDerecho - punteroIzquierdo + 1;

            // Update minimum window if current is smaller
            if (longitudVentanaActual < resultadoVentanaMinima[0]) {
                resultadoVentanaMinima = [longitudVentanaActual, punteroIzquierdo, punteroDerecho];
            }

            // Remove leftmost character from window
            const caracterIzquierdo = cadenaFuente[punteroIzquierdo];
            frecuenciaCaracterVentana.set(
                caracterIzquierdo,
                frecuenciaCaracterVentana.get(caracterIzquierdo) - 1
            );

            // Check if removing this character breaks the requirement
            if (frecuenciaCaracterObjetivo.has(caracterIzquierdo) &&
                frecuenciaCaracterVentana.get(caracterIzquierdo) < frecuenciaCaracterObjetivo.get(caracterIzquierdo)) {
                caracteresFormados--;
            }

            punteroIzquierdo++;
        }

        punteroDerecho++;
    }

    // Return the minimum window substring or empty string
    return resultadoVentanaMinima[0] === Infinity
        ? ""
        : cadenaFuente.slice(resultadoVentanaMinima[1], resultadoVentanaMinima[2] + 1);
}

// Helper function to validate the result
function validarVentanaCadena(cadenaFuente, cadenaObjetivo, ventanaResultado) {
    if (ventanaResultado === "" && cadenaObjetivo === "") {
        return true;
    }

    const contadorCaracterObjetivo = {};
    for (const caracter of cadenaObjetivo) {
        contadorCaracterObjetivo[caracter] = (contadorCaracterObjetivo[caracter] || 0) + 1;
    }

    const contadorCaracterVentana = {};
    for (const caracter of ventanaResultado) {
        contadorCaracterVentana[caracter] = (contadorCaracterVentana[caracter] || 0) + 1;
    }

    // Check if window contains all required characters
    for (const caracter in contadorCaracterObjetivo) {
        if ((contadorCaracterVentana[caracter] || 0) < contadorCaracterObjetivo[caracter]) {
            return false;
        }
    }

    return true;
}

// Test cases
const casosDePrueba = [
    { fuente: "ADOBECODEBANC", objetivo: "ABC", esperado: "BANC" },
    { fuente: "a", objetivo: "a", esperado: "a" },
    { fuente: "a", objetivo: "aa", esperado: "" }
];

for (const casoDePrueba of casosDePrueba) {
    const resultado = ventanaMinimaCadena(casoDePrueba.fuente, casoDePrueba.objetivo);
    const esValido = validarVentanaCadena(casoDePrueba.fuente, casoDePrueba.objetivo, resultado);
    console.log(`Input: s="${casoDePrueba.fuente}", t="${casoDePrueba.objetivo}"`);
    console.log(`Output: "${resultado}" | Valid: ${esValido}`);
    console.log("---");
}
