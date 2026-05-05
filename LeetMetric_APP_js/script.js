document.addEventListener("DOMContentLoaded", function () {

    const searchButton = document.getElementById("search-btn");
    const usernameInput = document.getElementById("user-input");
    const statsContainer = document.querySelector(".stats-container");

    const easyProgressCircle = document.querySelector(".easy-progress");
    const mediumProgressCircle = document.querySelector(".medium-progress");
    const hardProgressCircle = document.querySelector(".hard-progress");

    const easyLabel = document.getElementById("easy-label");
    const mediumLabel = document.getElementById("medium-label");
    const hardLabel = document.getElementById("hard-label");

    function validUsername(username) {
        if (username.trim() === "") {
            alert("Username should not be empty");
            return false;
        }

        const regex = /^[a-zA-Z0-9_]+$/;
        const isMatching = regex.test(username);

        if (!isMatching) {
            alert("Only letters, numbers, underscore allowed");
        }

        return isMatching;
    }

    async function fetchUserDetails(username) {

        try {

            const proxyUrl = 'https://cors-anywhere.herokuapp.com/'; // ✅ added trailing slash
            const targetUrl = "https://leetcode.com/graphql";         // ✅ fixed variable name casing

            const myHeaders = new Headers();
            myHeaders.append("content-type", "application/json");

            const graphql = JSON.stringify({
                query: `
                query userSessionProgress($username: String!) {
                    matchedUser(username: $username) {
                        submitStats {
                            acSubmissionNum {
                                difficulty
                                count
                            }
                        }
                    }
                }
                `,
                variables: { username: username }
            });

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: graphql,
                redirect: "follow"
            };

            searchButton.textContent = "Searching...";
            searchButton.disabled = true;

            const response = await fetch(proxyUrl + targetUrl, requestOptions); // ✅ now forms correct URL

            if (!response.ok) {
                throw new Error("Unable to fetch the User details");
            }

            const data = await response.json();
            console.log("Logging data:", data);

            displayUserData(data);

        } catch (error) {
            console.error(error);
            statsContainer.innerHTML = `<p>No data Found</p>`;
        } finally {
            searchButton.textContent = "Search";
            searchButton.disabled = false;
        }
    }

    function displayUserData(data) { // ✅ fully implemented
        const matchedUser = data?.data?.matchedUser;

        if (!matchedUser) {
            statsContainer.innerHTML = `<p>User not found</p>`;
            return;
        }

        const submissions = matchedUser.submitStats.acSubmissionNum;

        // submissions[0] = All, [1] = Easy, [2] = Medium, [3] = Hard
        const allCount    = submissions[0]?.count || 0;
        const easyCount   = submissions[1]?.count || 0;
        const mediumCount = submissions[2]?.count || 0;
        const hardCount   = submissions[3]?.count || 0;

        // Update labels
        easyLabel.textContent   = easyCount;
        mediumLabel.textContent = mediumCount;
        hardLabel.textContent   = hardCount;

        // Update stats card
        const statsCard = document.querySelector(".stats-card");
        statsCard.innerHTML = `
            <p><strong>Total Solved:</strong> ${allCount}</p>
            <p><strong>Easy:</strong> ${easyCount}</p>
            <p><strong>Medium:</strong> ${mediumCount}</p>
            <p><strong>Hard:</strong> ${hardCount}</p>
        `;
    }

    searchButton.addEventListener("click", function () {
        const username = usernameInput.value.trim();
        console.log("loggin username:", username);

        if (validUsername(username)) {
            fetchUserDetails(username);
        }
    });
});