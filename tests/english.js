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

function minWindowSubstring(sourceString, targetString) {
    if (sourceString.length === 0 || targetString.length === 0) {
        return "";
    }

    // Build frequency map for target string
    const targetCharFrequency = new Map();
    for (const character of targetString) {
        targetCharFrequency.set(
            character,
            (targetCharFrequency.get(character) || 0) + 1
        );
    }

    // Initialize sliding window variables
    let leftPointer = 0;
    let rightPointer = 0;
    let requiredCharacters = targetCharFrequency.size;
    let formedCharacters = 0;

    // Track character frequencies in current window
    const windowCharFrequency = new Map();

    // Store the result: [window length, left, right]
    let minimumWindowResult = [Infinity, 0, 0];

    while (rightPointer < sourceString.length) {
        // Expand window by adding character from right
        const currentCharacter = sourceString[rightPointer];
        windowCharFrequency.set(
            currentCharacter,
            (windowCharFrequency.get(currentCharacter) || 0) + 1
        );

        // Check if current character frequency matches target frequency
        if (targetCharFrequency.has(currentCharacter) &&
            windowCharFrequency.get(currentCharacter) === targetCharFrequency.get(currentCharacter)) {
            formedCharacters++;
        }

        // Try to contract window from left while it's valid
        while (formedCharacters === requiredCharacters && leftPointer <= rightPointer) {
            const currentWindowLength = rightPointer - leftPointer + 1;

            // Update minimum window if current is smaller
            if (currentWindowLength < minimumWindowResult[0]) {
                minimumWindowResult = [currentWindowLength, leftPointer, rightPointer];
            }

            // Remove leftmost character from window
            const leftCharacter = sourceString[leftPointer];
            windowCharFrequency.set(
                leftCharacter,
                windowCharFrequency.get(leftCharacter) - 1
            );

            // Check if removing this character breaks the requirement
            if (targetCharFrequency.has(leftCharacter) &&
                windowCharFrequency.get(leftCharacter) < targetCharFrequency.get(leftCharacter)) {
                formedCharacters--;
            }

            leftPointer++;
        }

        rightPointer++;
    }

    // Return the minimum window substring or empty string
    return minimumWindowResult[0] === Infinity
        ? ""
        : sourceString.slice(minimumWindowResult[1], minimumWindowResult[2] + 1);
}

// Helper function to validate the result
function validateWindowSubstring(sourceString, targetString, resultWindow) {
    if (resultWindow === "" && targetString === "") {
        return true;
    }

    const targetCharCount = {};
    for (const character of targetString) {
        targetCharCount[character] = (targetCharCount[character] || 0) + 1;
    }

    const windowCharCount = {};
    for (const character of resultWindow) {
        windowCharCount[character] = (windowCharCount[character] || 0) + 1;
    }

    // Check if window contains all required characters
    for (const character in targetCharCount) {
        if ((windowCharCount[character] || 0) < targetCharCount[character]) {
            return false;
        }
    }

    return true;
}

// Test cases
const testCases = [
    { source: "ADOBECODEBANC", target: "ABC", expected: "BANC" },
    { source: "a", target: "a", expected: "a" },
    { source: "a", target: "aa", expected: "" }
];

for (const testCase of testCases) {
    const result = minWindowSubstring(testCase.source, testCase.target);
    const isValid = validateWindowSubstring(testCase.source, testCase.target, result);
    console.log(`Input: s="${testCase.source}", t="${testCase.target}"`);
    console.log(`Output: "${result}" | Valid: ${isValid}`);
    console.log("---");
}
