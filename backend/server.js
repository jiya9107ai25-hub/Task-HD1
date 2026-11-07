const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const FormData = require("form-data");
const Mailgun = require("mailgun.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const {
    FieldValue
} = require("firebase-admin/firestore");

const db = require("./firebaseAdmin");


// ====================================================
// ENVIRONMENT
// ====================================================

dotenv.config({
    path: path.join(__dirname, ".env")
});

const app = express();

const PORT =
    process.env.PORT || 3000;


// ====================================================
// GENERAL MIDDLEWARE
// ====================================================

app.use(cors());

app.use(
    express.json({
        limit: "10kb"
    })
);


// ====================================================
// REQUIRED ENVIRONMENT VARIABLES
// ====================================================

if (!process.env.JWT_SECRET) {
    console.error(
        "Missing JWT_SECRET in backend/.env"
    );

    process.exit(1);
}

if (
    !process.env.MAILGUN_API_KEY ||
    !process.env.MAILGUN_DOMAIN
) {
    console.error(
        "Missing MAILGUN_API_KEY or MAILGUN_DOMAIN in backend/.env"
    );

    process.exit(1);
}


// ====================================================
// MAILGUN
// ====================================================

const mailgun =
    new Mailgun(FormData);

const mg =
    mailgun.client({
        username: "api",
        key:
            process.env.MAILGUN_API_KEY
    });


// ====================================================
// HELPERS
// ====================================================

function convertTimestamp(value) {
    if (!value) {
        return null;
    }

    if (
        typeof value.toDate ===
        "function"
    ) {
        return value
            .toDate()
            .toISOString();
    }

    return value;
}


function createSafePost(document) {
    const data =
        document.data();

    return {
        id:
            document.id,

        ...data,

        postType:
            typeof data.postType ===
            "string"
                ? data.postType.toLowerCase()
                : "question",

        plan:
            data.plan === "paid"
                ? "paid"
                : "free",

        status:
            data.status === "hidden"
                ? "hidden"
                : "active",

        createdAt:
            convertTimestamp(
                data.createdAt
            )
    };
}


// ====================================================
// HEALTH CHECK
// ====================================================

app.get(
    "/",
    function (req, res) {
        return res
            .status(200)
            .json({
                message:
                    "DEV@Deakin HD1 backend is running."
            });
    }
);


// ====================================================
// AUTHENTICATION MIDDLEWARE
// ====================================================

function authenticateToken(
    req,
    res,
    next
) {
    const authorizationHeader =
        req.headers.authorization;

    if (!authorizationHeader) {
        return res
            .status(401)
            .json({
                message:
                    "You must be logged in."
            });
    }

    const parts =
        authorizationHeader.split(" ");

    if (
        parts.length !== 2 ||
        parts[0] !== "Bearer" ||
        !parts[1]
    ) {
        return res
            .status(401)
            .json({
                message:
                    "Invalid authentication token."
            });
    }

    try {
        const decoded =
            jwt.verify(
                parts[1],
                process.env.JWT_SECRET
            );

        req.user =
            decoded;

        next();

    } catch (error) {
        return res
            .status(401)
            .json({
                message:
                    "Your session is invalid or has expired."
            });
    }
}


function optionalAuthentication(
    req,
    res,
    next
) {
    const authorizationHeader =
        req.headers.authorization;

    if (!authorizationHeader) {
        req.user =
            null;

        return next();
    }

    const parts =
        authorizationHeader.split(" ");

    if (
        parts.length !== 2 ||
        parts[0] !== "Bearer" ||
        !parts[1]
    ) {
        return res
            .status(401)
            .json({
                message:
                    "Invalid authentication token."
            });
    }

    try {
        req.user =
            jwt.verify(
                parts[1],
                process.env.JWT_SECRET
            );

        next();

    } catch (error) {
        return res
            .status(401)
            .json({
                message:
                    "Your session is invalid or has expired."
            });
    }
}


// ====================================================
// HD1 ADMIN AUTHORIZATION
// ====================================================

async function requireAdmin(
    req,
    res,
    next
) {
    try {
        if (
            !req.user ||
            !req.user.userId
        ) {
            return res
                .status(401)
                .json({
                    message:
                        "You must be logged in."
                });
        }

        const userDocument =
            await db
                .collection("users")
                .doc(
                    req.user.userId
                )
                .get();

        if (!userDocument.exists) {
            return res
                .status(404)
                .json({
                    message:
                        "User account could not be found."
                });
        }

        const userData =
            userDocument.data();

        if (
            userData.role !==
            "admin"
        ) {
            return res
                .status(403)
                .json({
                    message:
                        "Administrator access is required."
                });
        }

        req.currentUser = {
            id:
                userDocument.id,

            ...userData
        };

        next();

    } catch (error) {
        console.error(
            "Admin authorization error:",
            error
        );

        return res
            .status(500)
            .json({
                message:
                    "Unable to verify administrator access."
            });
    }
}


// ====================================================
// NEWSLETTER
// ====================================================

app.post(
    "/subscribe",
    async function (req, res) {
        const email =
            req.body?.email;

        if (
            typeof email !== "string" ||
            !email.trim()
        ) {
            return res
                .status(400)
                .json({
                    message:
                        "Please enter an email address."
                });
        }

        const cleanEmail =
            email.trim();

        const emailPattern =
            /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/;

        if (
            cleanEmail.length > 254 ||
            !emailPattern.test(
                cleanEmail
            )
        ) {
            return res
                .status(400)
                .json({
                    message:
                        "Please enter a valid email address."
                });
        }

        try {
            await mg.messages.create(
                process.env.MAILGUN_DOMAIN,
                {
                    from:
                        `DEV@Deakin <postmaster@${process.env.MAILGUN_DOMAIN}>`,

                    to: [
                        cleanEmail
                    ],

                    subject:
                        "Welcome to DEV@Deakin",

                    text:
                        "Welcome to DEV@Deakin! Thank you for subscribing to our Daily Insider.",

                    html: `
                        <h2>Welcome to DEV@Deakin!</h2>
                        <p>Thank you for subscribing to our Daily Insider.</p>
                        <p>Stay connected for developer news and updates.</p>
                    `
                }
            );

            return res
                .status(200)
                .json({
                    message:
                        "Subscription successful! Your welcome email is on its way."
                });

        } catch (error) {
            console.error(
                "Mailgun request failed:",
                error
            );

            return res
                .status(502)
                .json({
                    message:
                        "We could not send your welcome email. Please try again later."
                });
        }
    }
);


// ====================================================
// REGISTER
// ====================================================

app.post(
    "/register",
    async function (req, res) {
        const name =
            req.body?.name;

        const email =
            req.body?.email;

        const password =
            req.body?.password;

        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string"
        ) {
            return res
                .status(400)
                .json({
                    message:
                        "Invalid registration data."
                });
        }

        const cleanName =
            name.trim();

        const cleanEmail =
            email
                .trim()
                .toLowerCase();

        if (
            !cleanName ||
            !cleanEmail ||
            !password
        ) {
            return res
                .status(400)
                .json({
                    message:
                        "Please complete all required fields."
                });
        }

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (
            !emailPattern.test(
                cleanEmail
            )
        ) {
            return res
                .status(400)
                .json({
                    message:
                        "Please enter a valid email address."
                });
        }

        if (
            password.length < 6
        ) {
            return res
                .status(400)
                .json({
                    message:
                        "Password must contain at least 6 characters."
                });
        }

        try {
            const existingUsers =
                await db
                    .collection("users")
                    .where(
                        "email",
                        "==",
                        cleanEmail
                    )
                    .limit(1)
                    .get();

            if (
                !existingUsers.empty
            ) {
                return res
                    .status(409)
                    .json({
                        message:
                            "An account with this email already exists."
                    });
            }

            const hashedPassword =
                await bcrypt.hash(
                    password,
                    10
                );

            const userReference =
                await db
                    .collection("users")
                    .add({
                        name:
                            cleanName,

                        email:
                            cleanEmail,

                        password:
                            hashedPassword,

                        plan:
                            "free",

                        role:
                            "user",

                        createdAt:
                            FieldValue.serverTimestamp()
                    });

            return res
                .status(201)
                .json({
                    message:
                        "Account created successfully.",

                    user: {
                        id:
                            userReference.id,

                        name:
                            cleanName,

                        email:
                            cleanEmail,

                        plan:
                            "free",

                        role:
                            "user"
                    }
                });

        } catch (error) {
            console.error(
                "Registration error:",
                error
            );

            return res
                .status(500)
                .json({
                    message:
                        "Unable to create your account. Please try again."
                });
        }
    }
);


// ====================================================
// LOGIN
// ====================================================

app.post(
    "/login",
    async function (req, res) {
        const email =
            req.body?.email;

        const password =
            req.body?.password;

        if (
            typeof email !== "string" ||
            typeof password !== "string"
        ) {
            return res
                .status(400)
                .json({
                    message:
                        "Invalid login data."
                });
        }

        const cleanEmail =
            email
                .trim()
                .toLowerCase();

        if (
            !cleanEmail ||
            !password
        ) {
            return res
                .status(400)
                .json({
                    message:
                        "Please enter your email and password."
                });
        }

        try {
            const result =
                await db
                    .collection("users")
                    .where(
                        "email",
                        "==",
                        cleanEmail
                    )
                    .limit(1)
                    .get();

            if (result.empty) {
                return res
                    .status(401)
                    .json({
                        message:
                            "Incorrect email or password."
                    });
            }

            const userDocument =
                result.docs[0];

            const userData =
                userDocument.data();

            const passwordIsCorrect =
                await bcrypt.compare(
                    password,
                    userData.password
                );

            if (
                !passwordIsCorrect
            ) {
                return res
                    .status(401)
                    .json({
                        message:
                            "Incorrect email or password."
                    });
            }

            const token =
                jwt.sign(
                    {
                        userId:
                            userDocument.id,

                        email:
                            userData.email
                    },

                    process.env.JWT_SECRET,

                    {
                        expiresIn:
                            "2h"
                    }
                );

            return res
                .status(200)
                .json({
                    message:
                        "Login successful.",

                    token,

                    user: {
                        id:
                            userDocument.id,

                        name:
                            userData.name,

                        email:
                            userData.email,

                        plan:
                            userData.plan ||
                            "free",

                        role:
                            userData.role ||
                            "user"
                    }
                });

        } catch (error) {
            console.error(
                "Login error:",
                error
            );

            return res
                .status(500)
                .json({
                    message:
                        "Unable to log in. Please try again."
                });
        }
    }
);


// ====================================================
// UPGRADE PLAN
// ====================================================

app.patch(
    "/upgrade-plan",
    authenticateToken,
    async function (req, res) {
        const nameOnCard =
            req.body?.nameOnCard;

        const cardNumber =
            req.body?.cardNumber;

        const expiry =
            req.body?.expiry;

        const cvv =
            req.body?.cvv;

        if (
            typeof nameOnCard !== "string" ||
            typeof cardNumber !== "string" ||
            typeof expiry !== "string" ||
            typeof cvv !== "string"
        ) {
            return res
                .status(400)
                .json({
                    message:
                        "Please enter valid payment details."
                });
        }

        const cleanName =
            nameOnCard.trim();

        const cleanCard =
            cardNumber.replace(
                /\s/g,
                ""
            );

        const cleanExpiry =
            expiry.trim();

        const cleanCvv =
            cvv.trim();

        if (!cleanName) {
            return res
                .status(400)
                .json({
                    message:
                        "Please enter the name on the card."
                });
        }

        if (
            !/^\d{16}$/.test(
                cleanCard
            )
        ) {
            return res
                .status(400)
                .json({
                    message:
                        "Card number must contain 16 digits."
                });
        }

        if (
            !/^(0[1-9]|1[0-2])\/\d{2}$/.test(
                cleanExpiry
            )
        ) {
            return res
                .status(400)
                .json({
                    message:
                        "Expiry must be in MM/YY format."
                });
        }

        if (
            !/^\d{3,4}$/.test(
                cleanCvv
            )
        ) {
            return res
                .status(400)
                .json({
                    message:
                        "Please enter a valid CVV."
                });
        }

        try {
            const userReference =
                db
                    .collection("users")
                    .doc(
                        req.user.userId
                    );

            const userDocument =
                await userReference.get();

            if (
                !userDocument.exists
            ) {
                return res
                    .status(404)
                    .json({
                        message:
                            "User account could not be found."
                    });
            }

            const userData =
                userDocument.data();

            if (
                userData.plan ===
                "paid"
            ) {
                return res
                    .status(409)
                    .json({
                        message:
                            "You are already on the Paid plan."
                    });
            }

            await userReference.update({
                plan:
                    "paid",

                updatedAt:
                    FieldValue.serverTimestamp()
            });

            return res
                .status(200)
                .json({
                    message:
                        "Your account has been upgraded successfully.",

                    user: {
                        id:
                            userDocument.id,

                        name:
                            userData.name,

                        email:
                            userData.email,

                        plan:
                            "paid",

                        role:
                            userData.role ||
                            "user"
                    }
                });

        } catch (error) {
            console.error(
                "Plan upgrade error:",
                error
            );

            return res
                .status(500)
                .json({
                    message:
                        "Unable to upgrade your plan. Please try again."
                });
        }
    }
);


// ====================================================
// CREATE POST
// ====================================================

app.post(
    "/posts",
    authenticateToken,
    async function (req, res) {
        const postType =
            req.body?.postType;

        const title =
            req.body?.title;

        const description =
            req.body?.description;

        const abstract =
            req.body?.abstract;

        const articleText =
            req.body?.articleText;

        const tags =
            req.body?.tags;

        const plan =
            req.body?.plan;


        if (
            typeof postType !==
            "string"
        ) {
            return res
                .status(400)
                .json({
                    message:
                        "Please select Question or Article."
                });
        }

        const cleanPostType =
            postType
                .trim()
                .toLowerCase();

        if (
            ![
                "question",
                "article"
            ].includes(
                cleanPostType
            )
        ) {
            return res
                .status(400)
                .json({
                    message:
                        "Please select Question or Article."
                });
        }


        if (
            typeof title !==
            "string"
        ) {
            return res
                .status(400)
                .json({
                    message:
                        "Please enter a post title."
                });
        }

        const cleanTitle =
            title.trim();

        if (
            cleanTitle.length < 3 ||
            cleanTitle.length > 150
        ) {
            return res
                .status(400)
                .json({
                    message:
                        "Title must contain between 3 and 150 characters."
                });
        }


        if (
            typeof plan !==
            "string"
        ) {
            return res
                .status(400)
                .json({
                    message:
                        "Please select Free or Paid access."
                });
        }

        const cleanPlan =
            plan
                .trim()
                .toLowerCase();

        if (
            ![
                "free",
                "paid"
            ].includes(
                cleanPlan
            )
        ) {
            return res
                .status(400)
                .json({
                    message:
                        "Please select Free or Paid access."
                });
        }


        if (
            !Array.isArray(tags)
        ) {
            return res
                .status(400)
                .json({
                    message:
                        "Tags must be provided as a list."
                });
        }

        const cleanTags =
            tags
                .filter(
                    (tag) =>
                        typeof tag ===
                        "string"
                )
                .map(
                    (tag) =>
                        tag.trim()
                )
                .filter(Boolean)
                .slice(0, 3);


        if (
            cleanPostType ===
            "question"
        ) {
            if (
                typeof description !==
                    "string" ||
                !description.trim()
            ) {
                return res
                    .status(400)
                    .json({
                        message:
                            "Please describe your question."
                    });
            }

            if (
                description
                    .trim()
                    .length < 10
            ) {
                return res
                    .status(400)
                    .json({
                        message:
                            "Question description must contain at least 10 characters."
                    });
            }
        }


        if (
            cleanPostType ===
            "article"
        ) {
            if (
                typeof abstract !==
                    "string" ||
                !abstract.trim()
            ) {
                return res
                    .status(400)
                    .json({
                        message:
                            "Please enter an article abstract."
                    });
            }

            if (
                typeof articleText !==
                    "string" ||
                !articleText.trim()
            ) {
                return res
                    .status(400)
                    .json({
                        message:
                            "Please enter the article content."
                    });
            }
        }


        try {
            const userReference =
                db
                    .collection("users")
                    .doc(
                        req.user.userId
                    );

            const userDocument =
                await userReference.get();

            if (
                !userDocument.exists
            ) {
                return res
                    .status(404)
                    .json({
                        message:
                            "User account could not be found."
                    });
            }

            const userData =
                userDocument.data();


            const postData = {
                postType:
                    cleanPostType,

                title:
                    cleanTitle,

                tags:
                    cleanTags,

                plan:
                    cleanPlan,

                userId:
                    userDocument.id,

                authorName:
                    userData.name ||
                    "DEV@Deakin User",

                authorEmail:
                    userData.email,

                createdAt:
                    FieldValue.serverTimestamp(),

                status:
                    "active"
            };


            if (
                cleanPostType ===
                "question"
            ) {
                postData.description =
                    description.trim();
            }


            if (
                cleanPostType ===
                "article"
            ) {
                postData.abstract =
                    abstract.trim();

                postData.articleText =
                    articleText.trim();
            }


            const newPost =
                await db
                    .collection("posts")
                    .add(
                        postData
                    );


            return res
                .status(201)
                .json({
                    message:
                        "Post created successfully.",

                    post: {
                        id:
                            newPost.id,

                        postType:
                            cleanPostType,

                        title:
                            cleanTitle,

                        plan:
                            cleanPlan,

                        status:
                            "active",

                        tags:
                            cleanTags,

                        userId:
                            userDocument.id,

                        authorName:
                            userData.name ||
                            "DEV@Deakin User",

                        authorEmail:
                            userData.email
                    }
                });

        } catch (error) {
            console.error(
                "Create post error:",
                error
            );

            return res
                .status(500)
                .json({
                    message:
                        "Unable to create the post. Please try again."
                });
        }
    }
);


// ====================================================
// HD1 - GET ONE POST
// ====================================================

app.get(
    "/posts/:postId",
    optionalAuthentication,
    async function (req, res) {
        try {
            const postId =
                req.params.postId;

            const postDocument =
                await db
                    .collection("posts")
                    .doc(postId)
                    .get();

            if (
                !postDocument.exists
            ) {
                return res
                    .status(404)
                    .json({
                        message:
                            "Post could not be found."
                    });
            }

            const post =
                createSafePost(
                    postDocument
                );

            if (
                post.status ===
                "hidden"
            ) {
                return res
                    .status(404)
                    .json({
                        message:
                            "Post could not be found."
                    });
            }

            let viewerPlan =
                "visitor";

            if (req.user) {
                const userDocument =
                    await db
                        .collection("users")
                        .doc(
                            req.user.userId
                        )
                        .get();

                if (
                    !userDocument.exists
                ) {
                    return res
                        .status(404)
                        .json({
                            message:
                                "User account could not be found."
                        });
                }

                const userData =
                    userDocument.data();

                viewerPlan =
                    userData.plan ===
                    "paid"
                        ? "paid"
                        : "free";
            }

            if (
                post.plan ===
                    "paid" &&
                viewerPlan !==
                    "paid"
            ) {
                return res
                    .status(403)
                    .json({
                        message:
                            "A Paid subscription is required to view this post."
                    });
            }

            return res
                .status(200)
                .json({
                    viewerPlan,
                    post
                });

        } catch (error) {
            console.error(
                "Get post error:",
                error
            );

            return res
                .status(500)
                .json({
                    message:
                        "Unable to load the post."
                });
        }
    }
);


// ====================================================
// HD1 - GET COMMENTS
// ====================================================

app.get(
    "/posts/:postId/comments",
    optionalAuthentication,
    async function (req, res) {
        try {
            const postId =
                req.params.postId;


            const postDocument =
                await db
                    .collection("posts")
                    .doc(postId)
                    .get();


            if (
                !postDocument.exists
            ) {
                return res
                    .status(404)
                    .json({
                        message:
                            "Post could not be found."
                    });
            }


            const postData =
                postDocument.data();


            const postPlan =
                postData.plan ===
                "paid"
                    ? "paid"
                    : "free";


            const postStatus =
                postData.status ===
                "hidden"
                    ? "hidden"
                    : "active";


            if (
                postStatus ===
                "hidden"
            ) {
                return res
                    .status(404)
                    .json({
                        message:
                            "Post could not be found."
                    });
            }


            let viewerPlan =
                "visitor";


            if (req.user) {
                const userDocument =
                    await db
                        .collection("users")
                        .doc(
                            req.user.userId
                        )
                        .get();


                if (
                    !userDocument.exists
                ) {
                    return res
                        .status(404)
                        .json({
                            message:
                                "User account could not be found."
                        });
                }


                const userData =
                    userDocument.data();


                viewerPlan =
                    userData.plan ===
                    "paid"
                        ? "paid"
                        : "free";
            }


            if (
                postPlan ===
                    "paid" &&
                viewerPlan !==
                    "paid"
            ) {
                return res
                    .status(403)
                    .json({
                        message:
                            "A Paid subscription is required to view this discussion."
                    });
            }


            const snapshot =
                await db
                    .collection("comments")
                    .where(
                        "postId",
                        "==",
                        postId
                    )
                    .get();


            const comments =
                snapshot.docs
                    .map(
                        (document) => {
                            const data =
                                document.data();

                            return {
                                id:
                                    document.id,

                                ...data,

                                createdAt:
                                    convertTimestamp(
                                        data.createdAt
                                    )
                            };
                        }
                    )
                    .sort(
                        (
                            firstComment,
                            secondComment
                        ) => {
                            const firstDate =
                                firstComment.createdAt
                                    ? new Date(
                                        firstComment.createdAt
                                    ).getTime()
                                    : 0;


                            const secondDate =
                                secondComment.createdAt
                                    ? new Date(
                                        secondComment.createdAt
                                    ).getTime()
                                    : 0;


                            return (
                                firstDate -
                                secondDate
                            );
                        }
                    );


            return res
                .status(200)
                .json({
                    comments
                });


        } catch (error) {
            console.error(
                "Load comments error:",
                error
            );


            return res
                .status(500)
                .json({
                    message:
                        "Unable to load comments."
                });
        }
    }
);


// ====================================================
// HD1 - ADD COMMENT
// ====================================================

app.post(
    "/posts/:postId/comments",
    authenticateToken,
    async function (req, res) {
        try {
            const postId =
                req.params.postId;


            const content =
                req.body?.content;


            if (
                typeof content !==
                    "string" ||
                !content.trim()
            ) {
                return res
                    .status(400)
                    .json({
                        message:
                            "Please enter a comment."
                    });
            }


            const cleanContent =
                content.trim();


            if (
                cleanContent.length >
                500
            ) {
                return res
                    .status(400)
                    .json({
                        message:
                            "Comment must be 500 characters or fewer."
                    });
            }


            const postDocument =
                await db
                    .collection("posts")
                    .doc(postId)
                    .get();


            if (
                !postDocument.exists
            ) {
                return res
                    .status(404)
                    .json({
                        message:
                            "Post could not be found."
                    });
            }


            const postData =
                postDocument.data();


            if (
                postData.status ===
                "hidden"
            ) {
                return res
                    .status(404)
                    .json({
                        message:
                            "Post could not be found."
                    });
            }


            const userDocument =
                await db
                    .collection("users")
                    .doc(
                        req.user.userId
                    )
                    .get();


            if (
                !userDocument.exists
            ) {
                return res
                    .status(404)
                    .json({
                        message:
                            "User account could not be found."
                    });
            }


            const userData =
                userDocument.data();


            const userPlan =
                userData.plan ===
                "paid"
                    ? "paid"
                    : "free";


            if (
                postData.plan ===
                    "paid" &&
                userPlan !==
                    "paid"
            ) {
                return res
                    .status(403)
                    .json({
                        message:
                            "A Paid subscription is required to comment on this post."
                    });
            }


            const commentData = {
                postId,

                userId:
                    userDocument.id,

                authorName:
                    userData.name ||
                    "DEV@Deakin User",

                content:
                    cleanContent,

                parentCommentId:
                    null,

                createdAt:
                    FieldValue.serverTimestamp()
            };


            const commentReference =
                await db
                    .collection("comments")
                    .add(
                        commentData
                    );


            return res
                .status(201)
                .json({
                    message:
                        "Comment added successfully.",

                    comment: {
                        id:
                            commentReference.id,

                        postId,

                        userId:
                            userDocument.id,

                        authorName:
                            userData.name ||
                            "DEV@Deakin User",

                        content:
                            cleanContent,

                        parentCommentId:
                            null,

                        createdAt:
                            new Date()
                                .toISOString()
                    }
                });


        } catch (error) {
            console.error(
                "Create comment error:",
                error
            );


            return res
                .status(500)
                .json({
                    message:
                        "Unable to add comment."
                });
        }
    }
);


// ====================================================
// HD1 - REPLY TO COMMENT
// ====================================================

app.post(
    "/comments/:commentId/replies",
    authenticateToken,
    async function (req, res) {
        try {
            const parentCommentId =
                req.params.commentId;


            const content =
                req.body?.content;


            if (
                typeof content !==
                    "string" ||
                !content.trim()
            ) {
                return res
                    .status(400)
                    .json({
                        message:
                            "Please enter a reply."
                    });
            }


            const cleanContent =
                content.trim();


            if (
                cleanContent.length >
                500
            ) {
                return res
                    .status(400)
                    .json({
                        message:
                            "Reply must be 500 characters or fewer."
                    });
            }


            const parentDocument =
                await db
                    .collection("comments")
                    .doc(
                        parentCommentId
                    )
                    .get();


            if (
                !parentDocument.exists
            ) {
                return res
                    .status(404)
                    .json({
                        message:
                            "The comment you are replying to could not be found."
                    });
            }


            const parentData =
                parentDocument.data();


            const rootParentId =
                parentData.parentCommentId ||
                parentDocument.id;


            const postId =
                parentData.postId;


            const postDocument =
                await db
                    .collection("posts")
                    .doc(postId)
                    .get();


            if (
                !postDocument.exists
            ) {
                return res
                    .status(404)
                    .json({
                        message:
                            "Post could not be found."
                    });
            }


            const postData =
                postDocument.data();


            if (
                postData.status ===
                "hidden"
            ) {
                return res
                    .status(404)
                    .json({
                        message:
                            "Post could not be found."
                    });
            }


            const userDocument =
                await db
                    .collection("users")
                    .doc(
                        req.user.userId
                    )
                    .get();


            if (
                !userDocument.exists
            ) {
                return res
                    .status(404)
                    .json({
                        message:
                            "User account could not be found."
                    });
            }


            const userData =
                userDocument.data();


            const userPlan =
                userData.plan ===
                "paid"
                    ? "paid"
                    : "free";


            if (
                postData.plan ===
                    "paid" &&
                userPlan !==
                    "paid"
            ) {
                return res
                    .status(403)
                    .json({
                        message:
                            "A Paid subscription is required to reply to this discussion."
                    });
            }


            const replyData = {
                postId,

                userId:
                    userDocument.id,

                authorName:
                    userData.name ||
                    "DEV@Deakin User",

                content:
                    cleanContent,

                parentCommentId:
                    rootParentId,

                createdAt:
                    FieldValue.serverTimestamp()
            };


            const replyReference =
                await db
                    .collection("comments")
                    .add(
                        replyData
                    );


            return res
                .status(201)
                .json({
                    message:
                        "Reply added successfully.",

                    comment: {
                        id:
                            replyReference.id,

                        postId,

                        userId:
                            userDocument.id,

                        authorName:
                            userData.name ||
                            "DEV@Deakin User",

                        content:
                            cleanContent,

                        parentCommentId:
                            rootParentId,

                        createdAt:
                            new Date()
                                .toISOString()
                    }
                });


        } catch (error) {
            console.error(
                "Create reply error:",
                error
            );


            return res
                .status(500)
                .json({
                    message:
                        "Unable to add reply."
                });
        }
    }
);


// ====================================================
// HD1 - GET SAVED POSTS
// ====================================================

app.get(
    "/bookmarks",
    authenticateToken,
    async function (req, res) {
        try {
            const userId =
                req.user.userId;


            const userDocument =
                await db
                    .collection("users")
                    .doc(userId)
                    .get();


            if (
                !userDocument.exists
            ) {
                return res
                    .status(404)
                    .json({
                        message:
                            "User account could not be found."
                    });
            }


            const userData =
                userDocument.data();


            const userPlan =
                userData.plan ===
                "paid"
                    ? "paid"
                    : "free";


            const bookmarkSnapshot =
                await db
                    .collection("bookmarks")
                    .where(
                        "userId",
                        "==",
                        userId
                    )
                    .get();


            const postIds =
                bookmarkSnapshot.docs
                    .map(
                        (document) =>
                            document.data()
                                .postId
                    )
                    .filter(Boolean);


            const posts = [];


            for (
                const postId of postIds
            ) {
                const postDocument =
                    await db
                        .collection("posts")
                        .doc(postId)
                        .get();


                if (
                    !postDocument.exists
                ) {
                    continue;
                }


                const post =
                    createSafePost(
                        postDocument
                    );


                if (
                    post.status !==
                    "active"
                ) {
                    continue;
                }


                if (
                    post.plan ===
                        "paid" &&
                    userPlan !==
                        "paid"
                ) {
                    continue;
                }


                posts.push(
                    post
                );
            }


            posts.sort(
                (
                    firstPost,
                    secondPost
                ) => {
                    const firstDate =
                        firstPost.createdAt
                            ? new Date(
                                firstPost.createdAt
                            ).getTime()
                            : 0;


                    const secondDate =
                        secondPost.createdAt
                            ? new Date(
                                secondPost.createdAt
                            ).getTime()
                            : 0;


                    return (
                        secondDate -
                        firstDate
                    );
                }
            );


            return res
                .status(200)
                .json({
                    count:
                        posts.length,

                    posts
                });


        } catch (error) {
            console.error(
                "Get bookmarks error:",
                error
            );


            return res
                .status(500)
                .json({
                    message:
                        "Unable to load saved posts."
                });
        }
    }
);


// ====================================================
// HD1 - SAVE BOOKMARK
// ====================================================

app.post(
    "/bookmarks/:postId",
    authenticateToken,
    async function (req, res) {
        try {
            const userId =
                req.user.userId;


            const postId =
                req.params.postId;


            const postDocument =
                await db
                    .collection("posts")
                    .doc(postId)
                    .get();


            if (
                !postDocument.exists
            ) {
                return res
                    .status(404)
                    .json({
                        message:
                            "Post could not be found."
                    });
            }


            const post =
                createSafePost(
                    postDocument
                );


            if (
                post.status !==
                "active"
            ) {
                return res
                    .status(404)
                    .json({
                        message:
                            "Post could not be found."
                    });
            }


            const userDocument =
                await db
                    .collection("users")
                    .doc(userId)
                    .get();


            if (
                !userDocument.exists
            ) {
                return res
                    .status(404)
                    .json({
                        message:
                            "User account could not be found."
                    });
            }


            const userData =
                userDocument.data();


            const userPlan =
                userData.plan ===
                "paid"
                    ? "paid"
                    : "free";


            if (
                post.plan ===
                    "paid" &&
                userPlan !==
                    "paid"
            ) {
                return res
                    .status(403)
                    .json({
                        message:
                            "A Paid subscription is required to save this post."
                    });
            }


            const existingBookmark =
                await db
                    .collection("bookmarks")
                    .where(
                        "userId",
                        "==",
                        userId
                    )
                    .where(
                        "postId",
                        "==",
                        postId
                    )
                    .limit(1)
                    .get();


            if (
                !existingBookmark.empty
            ) {
                return res
                    .status(200)
                    .json({
                        message:
                            "Post is already saved.",

                        saved:
                            true
                    });
            }


            await db
                .collection("bookmarks")
                .add({
                    userId,

                    postId,

                    createdAt:
                        FieldValue.serverTimestamp()
                });


            return res
                .status(201)
                .json({
                    message:
                        "Post saved successfully.",

                    saved:
                        true
                });


        } catch (error) {
            console.error(
                "Save bookmark error:",
                error
            );


            return res
                .status(500)
                .json({
                    message:
                        "Unable to save this post."
                });
        }
    }
);


// ====================================================
// HD1 - REMOVE BOOKMARK
// ====================================================

app.delete(
    "/bookmarks/:postId",
    authenticateToken,
    async function (req, res) {
        try {
            const userId =
                req.user.userId;


            const postId =
                req.params.postId;


            const bookmarkSnapshot =
                await db
                    .collection("bookmarks")
                    .where(
                        "userId",
                        "==",
                        userId
                    )
                    .where(
                        "postId",
                        "==",
                        postId
                    )
                    .get();


            if (
                bookmarkSnapshot.empty
            ) {
                return res
                    .status(404)
                    .json({
                        message:
                            "Saved post could not be found."
                    });
            }


            const batch =
                db.batch();


            bookmarkSnapshot.docs.forEach(
                (document) => {
                    batch.delete(
                        document.ref
                    );
                }
            );


            await batch.commit();


            return res
                .status(200)
                .json({
                    message:
                        "Saved post removed successfully.",

                    saved:
                        false
                });


        } catch (error) {
            console.error(
                "Remove bookmark error:",
                error
            );


            return res
                .status(500)
                .json({
                    message:
                        "Unable to remove saved post."
                });
        }
    }
);

// ====================================================
// HD1 - ADMIN DASHBOARD
// ====================================================

app.get(
    "/admin/dashboard",
    authenticateToken,
    requireAdmin,
    async function (req, res) {
        try {

            const userSnapshot =
                await db
                    .collection("users")
                    .get();


            const postSnapshot =
                await db
                    .collection("posts")
                    .get();


            const posts =
                postSnapshot.docs.map(
                    createSafePost
                );


            const stats = {

                totalUsers:
                    userSnapshot.size,

                totalPosts:
                    posts.length,

                freePosts:
                    posts.filter(
                        (post) =>
                            post.plan ===
                            "free"
                    ).length,

                paidPosts:
                    posts.filter(
                        (post) =>
                            post.plan ===
                            "paid"
                    ).length,

                questions:
                    posts.filter(
                        (post) =>
                            post.postType ===
                            "question"
                    ).length,

                articles:
                    posts.filter(
                        (post) =>
                            post.postType ===
                            "article"
                    ).length,

                activePosts:
                    posts.filter(
                        (post) =>
                            post.status ===
                            "active"
                    ).length,

                hiddenPosts:
                    posts.filter(
                        (post) =>
                            post.status ===
                            "hidden"
                    ).length
            };


            posts.sort(
                (
                    firstPost,
                    secondPost
                ) => {

                    const firstDate =
                        firstPost.createdAt
                            ? new Date(
                                firstPost.createdAt
                            ).getTime()
                            : 0;


                    const secondDate =
                        secondPost.createdAt
                            ? new Date(
                                secondPost.createdAt
                            ).getTime()
                            : 0;


                    return (
                        secondDate -
                        firstDate
                    );
                }
            );


            return res
                .status(200)
                .json({
                    stats,
                    posts
                });


        } catch (error) {

            console.error(
                "Admin dashboard error:",
                error
            );


            return res
                .status(500)
                .json({
                    message:
                        "Unable to load the admin dashboard."
                });
        }
    }
);


// ====================================================
// HD1 - ADMIN HIDE POST
// ====================================================

app.patch(
    "/admin/posts/:postId/hide",
    authenticateToken,
    requireAdmin,
    async function (req, res) {
        try {

            const postId =
                req.params.postId;


            const postReference =
                db
                    .collection("posts")
                    .doc(postId);


            const postDocument =
                await postReference.get();


            if (
                !postDocument.exists
            ) {

                return res
                    .status(404)
                    .json({
                        message:
                            "Post could not be found."
                    });
            }


            await postReference.update({

                status:
                    "hidden",

                moderatedAt:
                    FieldValue.serverTimestamp(),

                moderatedBy:
                    req.currentUser.id
            });


            return res
                .status(200)
                .json({
                    message:
                        "Post hidden successfully.",

                    postId,

                    status:
                        "hidden"
                });


        } catch (error) {

            console.error(
                "Hide post error:",
                error
            );


            return res
                .status(500)
                .json({
                    message:
                        "Unable to hide this post."
                });
        }
    }
);


// ====================================================
// HD1 - ADMIN RESTORE POST
// ====================================================

app.patch(
    "/admin/posts/:postId/restore",
    authenticateToken,
    requireAdmin,
    async function (req, res) {
        try {

            const postId =
                req.params.postId;


            const postReference =
                db
                    .collection("posts")
                    .doc(postId);


            const postDocument =
                await postReference.get();


            if (
                !postDocument.exists
            ) {

                return res
                    .status(404)
                    .json({
                        message:
                            "Post could not be found."
                    });
            }


            await postReference.update({

                status:
                    "active",

                moderatedAt:
                    FieldValue.serverTimestamp(),

                moderatedBy:
                    req.currentUser.id
            });


            return res
                .status(200)
                .json({
                    message:
                        "Post restored successfully.",

                    postId,

                    status:
                        "active"
                });


        } catch (error) {

            console.error(
                "Restore post error:",
                error
            );


            return res
                .status(500)
                .json({
                    message:
                        "Unable to restore this post."
                });
        }
    }
);
// ====================================================
// BROWSE POSTS
// ====================================================

app.get(
    "/posts",
    optionalAuthentication,
    async function (req, res) {
        try {
            let viewerPlan =
                "visitor";


            if (req.user) {
                const userDocument =
                    await db
                        .collection("users")
                        .doc(
                            req.user.userId
                        )
                        .get();


                if (
                    !userDocument.exists
                ) {
                    return res
                        .status(404)
                        .json({
                            message:
                                "User account could not be found."
                        });
                }


                const userData =
                    userDocument.data();


                viewerPlan =
                    userData.plan ===
                    "paid"
                        ? "paid"
                        : "free";
            }


            const snapshot =
                await db
                    .collection("posts")
                    .get();


            let posts =
                snapshot.docs.map(
                    createSafePost
                );


            posts =
                posts.filter(
                    (post) =>
                        post.status ===
                        "active"
                );


            if (
                viewerPlan !==
                "paid"
            ) {
                posts =
                    posts.filter(
                        (post) =>
                            post.plan ===
                            "free"
                    );
            }


            posts.sort(
                (
                    firstPost,
                    secondPost
                ) => {
                    const firstDate =
                        firstPost.createdAt
                            ? new Date(
                                firstPost.createdAt
                            ).getTime()
                            : 0;


                    const secondDate =
                        secondPost.createdAt
                            ? new Date(
                                secondPost.createdAt
                            ).getTime()
                            : 0;


                    return (
                        secondDate -
                        firstDate
                    );
                }
            );


            return res
                .status(200)
                .json({
                    viewerPlan,

                    count:
                        posts.length,

                    posts
                });


        } catch (error) {
            console.error(
                "Browse posts error:",
                error
            );


            return res
                .status(500)
                .json({
                    message:
                        "Unable to load posts. Please try again."
                });
        }
    }
);


// ====================================================
// ERROR HANDLER
// ====================================================

app.use(
    function (
        error,
        req,
        res,
        next
    ) {
        if (
            error.type ===
            "entity.parse.failed"
        ) {
            return res
                .status(400)
                .json({
                    message:
                        "The request contains invalid JSON."
                });
        }


        if (
            error.type ===
            "entity.too.large"
        ) {
            return res
                .status(413)
                .json({
                    message:
                        "The request is too large."
                });
        }


        console.error(
            "Unexpected server error:",
            error
        );


        return res
            .status(500)
            .json({
                message:
                    "Something went wrong. Please try again later."
            });
    }
);


// ====================================================
// START SERVER
// ====================================================

app.listen(
    PORT,
    function () {
        console.log(
            `DEV@Deakin HD1 backend running on http://localhost:${PORT}`
        );
    }
);