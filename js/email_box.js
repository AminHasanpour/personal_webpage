// =============================================================================
// ================================= EMAIL BOX =================================
// =============================================================================

function validateMessage(message) {
    const re = /^[a-zA-Z0-9.,!?()@'"\s\-_:]{1,}$/;
    return re.test(String(message).trim());
}

function setupEmailBox() {
    (function () {
        emailjs.init("iSCxOn0RbDVs4wgML");
    })();

    document.querySelectorAll(".email-form").forEach((form) => {
        let textarea = form.querySelector("textarea"),
            button = form.querySelector("button"),
            getVar = (variable) =>
                getComputedStyle(button).getPropertyValue(variable);

        textarea.addEventListener("input", (e) => {
            form.classList.toggle("valid", validateMessage(textarea.value));
        });

        form.addEventListener("submit", (e) => {
            e.preventDefault();

            if (!validateMessage(textarea.value)) {
                textarea.focus();
                return;
            }

            if (!button.classList.contains("active")) {
                button.classList.add("active");

                gsap.to(button, {
                    keyframes: [
                        {
                            "--left-wing-first-x": "50%",
                            "--left-wing-first-y": "100%",
                            "--right-wing-second-x": "50%",
                            "--right-wing-second-y": "100%",
                            duration: 0.2,
                            onComplete() {
                                gsap.set(button, {
                                    "--left-wing-first-y": "0%",
                                    "--left-wing-second-x": "40%",
                                    "--left-wing-second-y": "100%",
                                    "--left-wing-third-x": "0%",
                                    "--left-wing-third-y": "100%",
                                    "--left-body-third-x": "40%",
                                    "--right-wing-first-x": "50%",
                                    "--right-wing-first-y": "0%",
                                    "--right-wing-second-x": "60%",
                                    "--right-wing-second-y": "100%",
                                    "--right-wing-third-x": "100%",
                                    "--right-wing-third-y": "100%",
                                    "--right-body-third-x": "60%"
                                });
                            }
                        },
                        {
                            "--left-wing-third-x": "20%",
                            "--left-wing-third-y": "90%",
                            "--left-wing-second-y": "90%",
                            "--left-body-third-y": "90%",
                            "--right-wing-third-x": "80%",
                            "--right-wing-third-y": "90%",
                            "--right-body-third-y": "90%",
                            "--right-wing-second-y": "90%",
                            duration: 0.2
                        },
                        {
                            "--rotate": "50deg",
                            "--left-wing-third-y": "95%",
                            "--left-wing-third-x": "27%",
                            "--right-body-third-x": "45%",
                            "--right-wing-second-x": "45%",
                            "--right-wing-third-x": "60%",
                            "--right-wing-third-y": "83%",
                            duration: 0.25
                        },
                        {
                            "--rotate": "60deg",
                            "--plane-x": "-8px",
                            "--plane-y": "40px",
                            duration: 0.2
                        },
                        {
                            "--rotate": "40deg",
                            "--plane-x": "45px",
                            "--plane-y": "-300px",
                            "--plane-opacity": 0,
                            duration: 0.375,
                            onComplete() {
                                setTimeout(() => {
                                    button.removeAttribute("style");
                                    gsap.fromTo(
                                        button,
                                        {
                                            opacity: 0,
                                            y: -8
                                        },
                                        {
                                            opacity: 1,
                                            y: 0,
                                            clearProps: true,
                                            duration: 0.3,
                                            onComplete() {
                                                button.classList.remove("active");
                                                form.classList.toggle("valid", false);
                                            }
                                        }
                                    );
                                }, 2500);
                            }
                        }
                    ]
                });

                gsap.to(button, {
                    keyframes: [
                        {
                            "--text-opacity": 0,
                            "--border-radius": "0px",
                            "--left-wing-background": getVar("--primary-dark"),
                            "--right-wing-background": getVar("--primary-dark"),
                            duration: 0.1
                        },
                        {
                            "--left-wing-background": getVar("--primary"),
                            "--right-wing-background": getVar("--primary"),
                            duration: 0.15
                        },
                        {
                            "--left-body-background": getVar("--primary-dark"),
                            "--right-body-background": getVar("--primary-darkest"),
                            duration: 0.25,
                            delay: 0.1
                        },
                        {
                            "--trails-stroke": "171px",
                            duration: 0.22,
                            delay: 0.22
                        },
                        {
                            "--success-opacity": 1,
                            "--success-x": "0px",
                            duration: 0.2,
                            delay: 0.15
                        },
                        {
                            "--success-stroke": "0px",
                            duration: 0.15
                        }
                    ]
                });

                // EmailJS parameters
                const emailParams = {
                    message: textarea.value,
                    to_email: "m.amin.hasanpour@gmail.com"
                };

                // Send the email using EmailJS
                emailjs.send("service_h4uzc6r", "template_qsr6ce3", emailParams).then(
                    function (response) {
                        console.log(
                            "Message successfully sent!",
                            response.status,
                            response.text
                        );

                        textarea.value = "";
                    },
                    function (error) {
                        button.querySelector("span.default").textContent = "Send";
                        console.log("Failed to send message.", error);
                        alert(
                            "Message could not be sent. Please ignore the 'Done' message in the page and try again later."
                        );
                    }
                );
            }
        });
    });
}