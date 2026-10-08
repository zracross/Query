/*************************************************
 * CLASS IX STUDENTS' COUNCIL
 * FRONTEND JAVASCRIPT
 *************************************************/


/* ================================================
   GOOGLE APPS SCRIPT URLS
================================================ */

const QUERY_API =
    "https://script.google.com/macros/s/AKfycby3oHj1Z2iMVe8GqdKEjhdXnrLUSUI97VUMQkvFcqjqqWCHwoKwBOOQE3HZjBhpSynC/exec";


const ADMIN_API =
    "https://script.google.com/macros/s/AKfycbwPaOp1inmz1trrX9pD5W-5BNew3T7df--JXwjZC0uC9RwfcinHK2SIj2qQwpEPtSMX/exec";


/* ================================================
   CAPTCHA
================================================ */

let captchaAnswer = 0;


function generateCaptcha() {

    const a =
        Math.floor(Math.random() * 9) + 1;

    const b =
        Math.floor(Math.random() * 9) + 1;

    captchaAnswer = a + b;

    document.getElementById(
        "captchaQuestion"
    ).textContent =
        `${a} + ${b} = ?`;
}


generateCaptcha();


/* ================================================
   PAGE NAVIGATION
================================================ */

function hideAllPages() {

    document
        .getElementById("submitPage")
        .classList.add("hidden");

    document
        .getElementById("checkPage")
        .classList.add("hidden");

    document
        .getElementById("adminLoginPage")
        .classList.add("hidden");

    document
        .getElementById("adminDashboardPage")
        .classList.add("hidden");

}


function openPage(page) {

    document
        .querySelector(".hero")
        .classList.add("hidden");

    document
        .querySelector(".options")
        .classList.add("hidden");

    hideAllPages();


    if (page === "submit") {

        document
            .getElementById("submitPage")
            .classList.remove("hidden");

    }


    if (page === "check") {

        document
            .getElementById("checkPage")
            .classList.remove("hidden");

    }


    if (page === "adminLogin") {

        document
            .getElementById("adminLoginPage")
            .classList.remove("hidden");

    }

}


function goHome() {

    hideAllPages();

    document
        .querySelector(".hero")
        .classList.remove("hidden");

    document
        .querySelector(".options")
        .classList.remove("hidden");

}


/* ================================================
   SUBMIT QUERY
================================================ */

document
    .getElementById("queryForm")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const name =
                document
                    .getElementById("studentName")
                    .value
                    .trim();


            const whatsapp =
                document
                    .getElementById("whatsapp")
                    .value
                    .trim();


            const query =
                document
                    .getElementById("query")
                    .value
                    .trim();


            const captcha =
                Number(
                    document
                        .getElementById("captchaAnswer")
                        .value
                );


            const result =
                document.getElementById(
                    "submitResult"
                );


            result.innerHTML =
                "";


            /* CAPTCHA */

            if (captcha !== captchaAnswer) {

                result.innerHTML =
                    `<div class="error">
                        Incorrect CAPTCHA. Please try again.
                    </div>`;

                generateCaptcha();

                return;
            }


            /* WhatsApp number validation */

            if (!/^[6-9]\d{9}$/.test(whatsapp)) {

                result.innerHTML =
                    `<div class="error">
                        Please enter a valid 10-digit WhatsApp number.
                    </div>`;

                return;
            }


            result.innerHTML =
                `<div>
                    Submitting your query...
                </div>`;


            try {

                const response =
                    await fetch(
                        QUERY_API,
                        {
                            method: "POST",

                            body: JSON.stringify({

                                action: "submitQuery",

                                whatsapp: whatsapp,

                                studentName: name,

                                query: query

                            })
                        }
                    );


                const data =
                    await response.json();


                if (data.success) {

                    result.innerHTML =
                        `
                        <div class="result-card">

                            <div class="success">
                                QUERY SUBMITTED SUCCESSFULLY
                            </div>

                            <h3 style="margin-top:12px">
                                ${escapeHTML(data.queryId)}
                            </h3>

                            <p style="
                                color:#9299ad;
                                margin-top:8px;
                                font-size:13px;
                            ">
                                Save this Query ID to check
                                your response later.
                            </p>

                        </div>
                        `;


                    document
                        .getElementById("queryForm")
                        .reset();

                    generateCaptcha();

                } else {

                    result.innerHTML =
                        `<div class="error">
                            ${escapeHTML(data.message)}
                        </div>`;

                }


            } catch (error) {

                result.innerHTML =
                    `<div class="error">
                        Unable to connect to the server.
                        Please try again.
                    </div>`;

                console.error(error);

            }

        }
    );


/* ================================================
   CHECK QUERY
================================================ */

async function checkQuery() {

    const queryId =
        document
            .getElementById("queryId")
            .value
            .trim();


    const result =
        document.getElementById(
            "queryResult"
        );


    if (!queryId) {

        result.innerHTML =
            `<div class="error">
                Please enter your Query ID.
            </div>`;

        return;
    }


    result.innerHTML =
        `<div>Checking query...</div>`;


    try {

        const response =
            await fetch(
                QUERY_API +
                "?action=checkQuery&queryId=" +
                encodeURIComponent(queryId)
            );


        const data =
            await response.json();


        if (!data.success) {

            result.innerHTML =
                `<div class="error">
                    ${escapeHTML(data.message)}
                </div>`;

            return;
        }


        const q =
            data.query;


        let replyHTML = "";


        if (q.status === "REPLIED") {

            replyHTML =
                `
                <div class="reply-box">

                    <strong>COUNCIL RESPONSE</strong>

                    <p style="
                        margin-top:10px;
                        line-height:1.6;
                    ">
                        ${escapeHTML(
                            q.adminReply || ""
                        )}
                    </p>

                    <p style="
                        margin-top:12px;
                        color:#9299ad;
                        font-size:11px;
                    ">
                        Replied by:
                        <strong>
                            ${escapeHTML(
                                q.adminUser || "Council Admin"
                            )}
                        </strong>
                    </p>

                    <p style="
                        color:#9299ad;
                        font-size:11px;
                    ">
                        ${escapeHTML(
                            q.replyTime || ""
                        )}
                    </p>

                </div>
                `;

        }


        if (q.status === "REJECTED") {

            replyHTML =
                `
                <div class="reply-box">

                    <strong>
                        QUERY REJECTED
                    </strong>

                    <p style="
                        margin-top:10px;
                        color:#9299ad;
                    ">
                        This query was rejected by
                        ${escapeHTML(
                            q.adminUser || "Council Admin"
                        )}.
                    </p>

                </div>
                `;

        }


        result.innerHTML =
            `
            <div class="result-card">

                <span class="query-status">
                    ${escapeHTML(q.status)}
                </span>

                <h3 style="margin-top:15px">
                    ${escapeHTML(q.queryId)}
                </h3>

                <p style="
                    margin-top:12px;
                    line-height:1.6;
                    color:#b7bdcc;
                ">
                    ${escapeHTML(q.query)}
                </p>

                <p style="
                    margin-top:15px;
                    color:#777f91;
                    font-size:11px;
                ">
                    Submitted:
                    ${escapeHTML(q.submissionDate)}
                    ${escapeHTML(q.submissionTime)}
                </p>

                ${replyHTML}

            </div>
            `;


    } catch (error) {

        result.innerHTML =
            `<div class="error">
                Unable to connect to the server.
            </div>`;

        console.error(error);

    }

}


/* ================================================
   ADMIN LOGIN
================================================ */

async function adminLogin() {

    const adminId =
        document
            .getElementById("adminId")
            .value
            .trim();


    const password =
        document
            .getElementById("adminPassword")
            .value;


    const result =
        document.getElementById(
            "loginResult"
        );


    if (!adminId || !password) {

        result.innerHTML =
            `<div class="error">
                Enter Admin ID and Password.
            </div>`;

        return;
    }


    result.innerHTML =
        `<div>Authenticating...</div>`;


    try {

        const response =
            await fetch(
                ADMIN_API,
                {
                    method: "POST",

                    body: JSON.stringify({

                        action: "adminLogin",

                        adminId: adminId,

                        password: password

                    })
                }
            );


        const data =
            await response.json();


        if (!data.success) {

            result.innerHTML =
                `<div class="error">
                    ${escapeHTML(data.message)}
                </div>`;

            return;
        }


        /*
         * Temporary frontend session.
         *
         * The complete secure admin session will
         * be added with the admin query-management API.
         */

        sessionStorage.setItem(
            "councilAdmin",
            data.adminId
        );


        document
            .getElementById("adminLoginPage")
            .classList.add("hidden");


        document
            .getElementById("adminDashboardPage")
            .classList.remove("hidden");


        document
            .querySelector(".hero")
            .classList.add("hidden");


        document
            .querySelector(".options")
            .classList.add("hidden");


        loadDashboard();


    } catch (error) {

        result.innerHTML =
            `<div class="error">
                Unable to connect to Admin server.
            </div>`;

        console.error(error);

    }

}


/* ================================================
   ADMIN DASHBOARD
================================================ */

function loadDashboard() {

    /*
     * The current Query API doesn't yet have a
     * listQueries endpoint.
     *
     * Therefore these values remain unavailable
     * until that endpoint is added.
     */

    document.getElementById(
        "totalQueries"
    ).textContent = "—";

    document.getElementById(
        "pendingQueries"
    ).textContent = "—";

    document.getElementById(
        "repliedQueries"
    ).textContent = "—";

}


/* ================================================
   ADMIN LOGOUT
================================================ */

function logoutAdmin() {

    sessionStorage.removeItem(
        "councilAdmin"
    );

    hideAllPages();

    goHome();

}


/* ================================================
   HTML SECURITY
================================================ */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}
