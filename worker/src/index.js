export default {
    async fetch(request, env) {

        const url = new URL(request.url);

        /*
         * =========================================
         * CORS
         * =========================================
         */

        const allowedOrigin =
            env.ALLOWED_ORIGIN ||
            "https://apps.laxmannepal.com.np";

        const corsHeaders = {
            "Access-Control-Allow-Origin": allowedOrigin,
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Cache-Control": "no-store"
        };


        /*
         * =========================================
         * OPTIONS
         * =========================================
         */

        if (request.method === "OPTIONS") {

            return new Response(null, {
                status: 204,
                headers: corsHeaders
            });

        }


        /*
         * =========================================
         * ROUTER
         * =========================================
         */

        try {

            if (
                request.method === "POST" &&
                url.pathname === "/api/run-audit"
            ) {

                return await runAudit(
                    request,
                    env,
                    corsHeaders
                );

            }


            if (
                request.method === "GET" &&
                url.pathname === "/api/status"
            ) {

                return await getStatus(
                    env,
                    corsHeaders
                );

            }


            if (
                request.method === "GET" &&
                url.pathname === "/api/audit"
            ) {

                return await getAudit(
                    env,
                    corsHeaders
                );

            }


            if (
                request.method === "GET" &&
                url.pathname === "/"
            ) {

                return jsonResponse(
                    {
                        name: "Nisulka Tools Admin API",
                        status: "online"
                    },
                    200,
                    corsHeaders
                );

            }


            return jsonResponse(
                {
                    error: "Not found"
                },
                404,
                corsHeaders
            );

        } catch (error) {

            console.error(error);

            return jsonResponse(
                {
                    error: "Internal server error"
                },
                500,
                corsHeaders
            );

        }

    }
};


/*
 * =========================================
 * RUN AUDIT
 * =========================================
 */

async function runAudit(
    request,
    env,
    corsHeaders
) {

    /*
     * Global cooldown.
     *
     * This prevents people from repeatedly
     * triggering GitHub Actions.
     */

    const cooldownKey =
        "seo-audit:last-run";


    if (env.AUDIT_KV) {

        const lastRun =
            await env.AUDIT_KV.get(
                cooldownKey
            );


        if (lastRun) {

            const last =
                Number(lastRun);

            const now =
                Date.now();

            const elapsed =
                now - last;

            const cooldown =
                5 * 60 * 1000;


            if (elapsed < cooldown) {

                const remaining =
                    Math.ceil(
                        (cooldown - elapsed) /
                        1000
                    );

                return jsonResponse(
                    {
                        ok: false,
                        error:
                            "Audit is on cooldown.",
                        retryAfter:
                            remaining
                    },
                    429,
                    corsHeaders
                );

            }

        }

    }


    /*
     * GitHub API
     */

    const owner =
        env.GITHUB_OWNER;

    const repo =
        env.GITHUB_REPO;

    const workflow =
        env.GITHUB_WORKFLOW ||
        "seo-audit.yml";

    const branch =
        env.GITHUB_BRANCH ||
        "main";


    if (
        !owner ||
        !repo ||
        !env.GITHUB_TOKEN
    ) {

        return jsonResponse(
            {
                error:
                    "GitHub Worker configuration is incomplete."
            },
            500,
            corsHeaders
        );

    }


    const endpoint =
        `https://api.github.com/repos/${owner}/${repo}` +
        `/actions/workflows/${workflow}/dispatches`;


    const response =
        await fetch(
            endpoint,
            {
                method: "POST",

                headers: {

                    "Accept":
                        "application/vnd.github+json",

                    "Authorization":
                        `Bearer ${env.GITHUB_TOKEN}`,

                    "X-GitHub-Api-Version":
                        "2026-03-10",

                    "User-Agent":
                        "Nisulka-Tools-Admin"

                },

                body: JSON.stringify({
                    ref: branch
                })

            }
        );


    if (!response.ok) {

        const text =
            await response.text();

        console.error(
            "GitHub dispatch failed:",
            text
        );

        return jsonResponse(
            {
                ok: false,
                error:
                    "GitHub could not start the audit."
            },
            response.status,
            corsHeaders
        );

    }


    /*
     * Save cooldown timestamp.
     */

    if (env.AUDIT_KV) {

        await env.AUDIT_KV.put(
            cooldownKey,
            String(Date.now()),
            {
                expirationTtl:
                    600
            }
        );

    }


    return jsonResponse(
        {
            ok: true,
            message:
                "SEO audit started.",
            workflow:
                workflow,
            branch:
                branch,
            startedAt:
                new Date().toISOString()
        },
        202,
        corsHeaders
    );

}


/*
 * =========================================
 * GET GITHUB ACTION STATUS
 * =========================================
 */

async function getStatus(
    env,
    corsHeaders
) {

    const owner =
        env.GITHUB_OWNER;

    const repo =
        env.GITHUB_REPO;

    const workflow =
        env.GITHUB_WORKFLOW ||
        "seo-audit.yml";


    const endpoint =
        `https://api.github.com/repos/${owner}/${repo}` +
        `/actions/workflows/${workflow}/runs` +
        `?per_page=5`;


    const response =
        await fetch(
            endpoint,
            {
                headers: {

                    "Accept":
                        "application/vnd.github+json",

                    "Authorization":
                        `Bearer ${env.GITHUB_TOKEN}`,

                    "X-GitHub-Api-Version":
                        "2026-03-10",

                    "User-Agent":
                        "Nisulka-Tools-Admin"

                }
            }
        );


    if (!response.ok) {

        return jsonResponse(
            {
                error:
                    "Unable to read GitHub Actions status."
            },
            response.status,
            corsHeaders
        );

    }


    const data =
        await response.json();


    const runs =
        (data.workflow_runs || [])
            .map(run => ({

                id:
                    run.id,

                status:
                    run.status,

                conclusion:
                    run.conclusion,

                createdAt:
                    run.created_at,

                updatedAt:
                    run.updated_at,

                htmlUrl:
                    run.html_url,

                runNumber:
                    run.run_number

            }));


    return jsonResponse(
        {
            workflow,
            runs
        },
        200,
        corsHeaders
    );

}


/*
 * =========================================
 * GET SEO AUDIT DATA
 * =========================================
 */

async function getAudit(
    env,
    corsHeaders
) {

    const owner =
        env.GITHUB_OWNER;

    const repo =
        env.GITHUB_REPO;

    const branch =
        env.GITHUB_BRANCH ||
        "main";


    const endpoint =
        `https://api.github.com/repos/${owner}/${repo}` +
        `/contents/data/seo-audit.json?ref=${branch}`;


    const response =
        await fetch(
            endpoint,
            {
                headers: {

                    "Accept":
                        "application/vnd.github+json",

                    "Authorization":
                        `Bearer ${env.GITHUB_TOKEN}`,

                    "X-GitHub-Api-Version":
                        "2026-03-10",

                    "User-Agent":
                        "Nisulka-Tools-Admin"

                }
            }
        );


    if (!response.ok) {

        return jsonResponse(
            {
                error:
                    "SEO audit file is not available yet.",
                status:
                    response.status
            },
            response.status,
            corsHeaders
        );

    }


    const data =
        await response.json();


    if (!data.content) {

        return jsonResponse(
            {
                error:
                    "Invalid SEO audit response."
            },
            500,
            corsHeaders
        );

    }


    /*
     * GitHub returns Base64 content.
     */

    const binary =
        atob(
            data.content.replace(
                /\s/g,
                ""
            )
        );


    const bytes =
        Uint8Array.from(
            binary,
            char => char.charCodeAt(0)
        );


    const decoded =
        new TextDecoder()
            .decode(bytes);


    const audit =
        JSON.parse(decoded);


    return jsonResponse(
        audit,
        200,
        corsHeaders
    );

}


/*
 * =========================================
 * JSON RESPONSE
 * =========================================
 */

function jsonResponse(
    data,
    status,
    corsHeaders
) {

    return new Response(
        JSON.stringify(
            data,
            null,
            2
        ),
        {
            status,
            headers: {

                ...corsHeaders,

                "Content-Type":
                    "application/json; charset=utf-8"

            }
        }
    );

}
